import * as Conquete from 'conquete';
import type { ConqueteGame, GameStateJSON, MoveJSON } from 'conquete';
import { EventEmitter } from '../core/emitter';
import { AiPlayer, type Scheduler } from './ai-player';
import { AiStrategy } from './ai-strategy';
import {
    AI_DELAYS,
    type BattleOutcome,
    type DiceRoll,
    type LogEntry,
    type PlayerConfig,
    type Prompt,
    type SavedGame,
    type SessionConfig
} from './types';

const { GAME_EVENTS, PLAYER_EVENTS, PHASES } = Conquete;

const SAVE_KEY = 'conquete:save';
const MAX_LOG_ENTRIES = 200;

interface BattleTally {
    from: string;
    to: string;
    attacker: string;
    defender: string;
    attackerUnits: number;
    defenderUnits: number;
    attackerLost: number;
    defenderLost: number;
}

export class GameSession implements Scheduler {
    readonly game: ConqueteGame;
    readonly prompts = new Map<string, Prompt>();
    readonly log: LogEntry[] = [];
    readonly queuedMoves = new Map<string, MoveJSON>();
    lastRoll: DiceRoll | null = null;
    lastOutcome: BattleOutcome | null = null;
    error: string | null = null;
    notice: string | null = null;
    winner: string | null = null;
    autoRoll = false;
    autoSetup = false;

    private readonly gameEvents = new EventEmitter();
    private readonly playerEvents = new Map<string, EventEmitter>();
    private readonly assistants = new Map<string, AiStrategy>();
    private readonly subscribers = new Set<() => void>();
    private readonly timers = new Set<number>();
    private cachedState: GameStateJSON | null = null;
    private tally: BattleTally | null = null;
    private notifyQueued = false;
    private logCounter = 0;
    private disposed = false;

    constructor(readonly config: SessionConfig, savedState: GameStateJSON | null = null) {
        for (const player of config.players) {
            this.playerEvents.set(player.id, new EventEmitter());
        }

        this.game = Conquete.Game({
            listener: this.gameEvents,
            players: config.players.map(player => ({
                id: player.id,
                listener: this.playerEvents.get(player.id) as EventEmitter
            }))
        }, savedState);

        this.listenToGame();

        for (const player of config.players) {
            const listener = this.playerEvents.get(player.id) as EventEmitter;

            if (player.kind === 'ai') {
                new AiPlayer(this.game, player.id, listener, this);
            } else {
                this.assistants.set(player.id, new AiStrategy(this.game, player.id));
                this.listenToHuman(player.id, listener);
            }
        }
    }

    static loadSaved(): SavedGame | null {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            const saved = raw ? JSON.parse(raw) as SavedGame : null;

            return saved && saved.version === 1 ? saved : null;
        } catch {
            return null;
        }
    }

    static clearSaved(): void {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch {
            // storage unavailable
        }
    }

    start(): void {
        this.game.start();
        this.changed();
    }

    dispose(): void {
        this.disposed = true;
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        this.subscribers.clear();
    }

    subscribe(listener: () => void): () => void {
        this.subscribers.add(listener);

        return () => this.subscribers.delete(listener);
    }

    schedule(task: () => void, delayFactor = 1): void {
        const timer = window.setTimeout(() => {
            this.timers.delete(timer);

            if (this.disposed) {
                return;
            }

            try {
                task();
            } catch (error) {
                console.error(error);
            }
        }, AI_DELAYS[this.config.aiSpeed] * delayFactor);

        this.timers.add(timer);
    }

    get state(): GameStateJSON {
        if (!this.cachedState) {
            this.cachedState = this.game.state;
        }

        return this.cachedState;
    }

    player(playerId: string): PlayerConfig {
        const player = this.config.players.find(candidate => candidate.id === playerId);

        if (!player) {
            throw new Error(`Unknown player "${playerId}"`);
        }

        return player;
    }

    isHuman(playerId: string | null | undefined): boolean {
        return !!playerId && this.player(playerId).kind === 'human';
    }

    get currentPlayerId(): string {
        return this.state.turn.player;
    }

    get activeHuman(): PlayerConfig | null {
        const battle = this.state.turn.battle;
        const actorId = battle ? battle.turn : this.currentPlayerId;

        return this.isHuman(actorId) && this.prompts.has(actorId) ? this.player(actorId) : null;
    }

    get viewer(): PlayerConfig | null {
        const humans = this.config.players.filter(player => player.kind === 'human');
        const current = humans.find(player => player.id === this.currentPlayerId);

        if (current) {
            return current;
        }

        const alive = humans.find(player => !this.state.players.find(p => p.id === player.id)?.dead);

        return alive ?? humans[0] ?? null;
    }

    setSpeed(speed: SessionConfig['aiSpeed']): void {
        this.config.aiSpeed = speed;
        this.save();
        this.changed();
    }

    dismissOutcome(): void {
        this.lastOutcome = null;
        this.changed();
    }

    clearError(): void {
        this.error = null;
        this.notice = null;
        this.changed();
    }

    claimTerritory(territoryId: string): void {
        this.perform(playerId => this.game.act.claimTerritory(playerId, territoryId));
    }

    deployOneUnit(territoryId: string): void {
        this.perform(playerId => this.game.act.deployOneUnit(playerId, territoryId));
    }

    deployUnits(territoryId: string, units: number): void {
        this.perform(playerId => this.game.act.deployUnits(playerId, territoryId, units));
    }

    redeemCards(cards: string[]): void {
        this.perform(playerId => this.game.act.redeemCards(playerId, cards));
    }

    toAttackPhase(): void {
        this.perform(playerId => this.game.act.attackPhase(playerId));
    }

    attack(from: string, to: string, units: number): void {
        this.lastOutcome = null;
        this.perform(playerId => this.game.act.attack(playerId, from, to, units));
    }

    rollDice(dice: number, auto = false): void {
        this.autoRoll = auto;
        this.perform(playerId => this.game.act.rollDice(playerId, dice));
    }

    toFortifyPhase(): void {
        this.lastOutcome = null;
        this.perform(playerId => this.game.act.fortifyPhase(playerId));
    }

    moveUnits(from: string, to: string, units: number): void {
        this.perform(playerId => this.game.act.moveUnits(playerId, from, to, units));
    }

    endTurn(): void {
        this.perform(playerId => this.game.act.endTurn(playerId));
    }

    enableAutoSetup(): void {
        this.autoSetup = true;

        const human = this.activeHuman;

        if (human) {
            this.runSetupAssistant(human.id);
        }

        this.changed();
    }

    private perform(action: (playerId: string) => void): void {
        const human = this.activeHuman;

        if (!human) {
            return;
        }

        this.error = null;

        try {
            action(human.id);
        } catch (error) {
            this.error = error instanceof Error ? error.message : String(error);
        }

        this.changed();
    }

    private changed(): void {
        this.cachedState = null;

        if (this.notifyQueued || this.disposed) {
            return;
        }

        this.notifyQueued = true;
        requestAnimationFrame(() => {
            this.notifyQueued = false;

            if (!this.disposed) {
                this.subscribers.forEach(listener => listener());
            }
        });
    }

    private name(playerId: string): string {
        return this.player(playerId).name;
    }

    private territoryName(territoryId: string): string {
        return this.game.board.getTerritory(territoryId).name;
    }

    private addLog(text: string, playerId: string | null, kind: LogEntry['kind'] = 'info'): void {
        this.log.unshift({ id: ++this.logCounter, text, playerId, kind });
        this.log.length = Math.min(this.log.length, MAX_LOG_ENTRIES);
    }

    private isSetup(): boolean {
        return this.game.phase === PHASES.SETUP_A || this.game.phase === PHASES.SETUP_B;
    }

    private listenToGame(): void {
        const on = (event: string, handler: (data: any) => void) => {
            this.gameEvents.on(event, data => {
                this.cachedState = null;
                handler(data);
                this.changed();
            });
        };

        on(GAME_EVENTS.GAME_START, () => this.addLog('The campaign begins.', null, 'major'));

        on(GAME_EVENTS.PHASE_CHANGE, (data: { phase: string }) => {
            const labels: Record<string, string> = {
                setup_a: 'Setup — players claim territories in turn.',
                setup_b: 'Setup — players reinforce their territories.',
                battle: 'All armies placed. War begins!'
            };

            if (labels[data.phase]) {
                this.addLog(labels[data.phase], null, 'major');
            }
        });

        on(GAME_EVENTS.TURN_CHANGE, (data: { playerId: string }) => {
            this.lastRoll = null;
            this.queuedMoves.clear();

            if (!this.isSetup()) {
                this.lastOutcome = null;
                this.addLog(`Turn: ${this.name(data.playerId)}`, data.playerId, 'turn');
            }

            this.schedule(() => this.save(), 0);
        });

        on(GAME_EVENTS.DEPLOY_UNITS, (data: { playerId: string; territoryId: string; units: number }) => {
            if (!this.isSetup()) {
                this.addLog(`${this.name(data.playerId)} deployed ${data.units} on ${this.territoryName(data.territoryId)}.`, data.playerId);
            }
        });

        on(GAME_EVENTS.REDEEM_CARDS, (data: { playerId: string; bonus: number }) => {
            this.addLog(`${this.name(data.playerId)} traded in cards for ${data.bonus} armies.`, data.playerId, 'major');
        });

        on(GAME_EVENTS.ATTACK, (data: { from: string; to: string; attacker: string; defender: string; units: number }) => {
            this.lastRoll = null;
            this.lastOutcome = null;
            this.tally = {
                from: data.from,
                to: data.to,
                attacker: data.attacker,
                defender: data.defender,
                attackerUnits: data.units,
                defenderUnits: this.game.battle?.defender.initialUnits ?? 0,
                attackerLost: 0,
                defenderLost: 0
            };
        });

        on(GAME_EVENTS.ATTACK_DICE_ROLL, (data: { dice: number[] }) => {
            this.lastRoll = { attacker: data.dice, defender: [], attackKilled: 0, defendKilled: 0 };
        });

        on(GAME_EVENTS.DEFEND_DICE_ROLL, (data: { dice: number[]; results: { attackKilled: number; defendKilled: number } }) => {
            this.lastRoll = {
                attacker: this.lastRoll?.attacker ?? [],
                defender: data.dice,
                attackKilled: data.results.attackKilled,
                defendKilled: data.results.defendKilled
            };

            if (this.tally) {
                this.tally.attackerLost += data.results.attackKilled;
                this.tally.defenderLost += data.results.defendKilled;
            }
        });

        on(GAME_EVENTS.BATTLE_END, (data: { winner: string; type: 'attacker' | 'defender' }) => {
            this.autoRoll = false;

            if (!this.tally) {
                return;
            }

            const tally = this.tally;
            const to = this.territoryName(tally.to);

            this.lastOutcome = { ...tally, winner: data.winner };
            this.tally = null;

            const losses = `(lost ${tally.attackerLost}, killed ${tally.defenderLost})`;

            if (data.type === 'attacker') {
                this.addLog(`${this.name(tally.attacker)} conquered ${to} from ${this.name(tally.defender)} ${losses}.`, tally.attacker, 'battle');
            } else {
                this.addLog(`${this.name(tally.defender)} held ${to} against ${this.name(tally.attacker)} ${losses}.`, tally.defender, 'battle');
            }
        });

        on(GAME_EVENTS.PLAYER_DEFEATED, (data: { playerId: string; defeatedBy: string; numberOfCardsTaken: number }) => {
            const cards = data.numberOfCardsTaken ? ` and took ${data.numberOfCardsTaken} cards` : '';

            this.addLog(`${this.name(data.defeatedBy)} eliminated ${this.name(data.playerId)}${cards}.`, data.defeatedBy, 'major');
        });

        on(GAME_EVENTS.MOVE_UNITS, (data: { playerId: string; movements: MoveJSON[] }) => {
            this.queuedMoves.clear();

            for (const move of data.movements) {
                this.addLog(`${this.name(data.playerId)} moved ${move.units} from ${this.territoryName(move.from)} to ${this.territoryName(move.to)}.`, data.playerId);
            }
        });

        on(GAME_EVENTS.GAME_END, (data: { winner: string }) => {
            this.winner = data.winner;
            this.addLog(`Victory for ${this.name(data.winner)}!`, data.winner, 'major');
            GameSession.clearSaved();
        });
    }

    private listenToHuman(playerId: string, listener: EventEmitter): void {
        const prompt = (event: string, build: (data: any) => Prompt) => {
            listener.on(event, data => {
                this.prompts.clear();
                this.prompts.set(playerId, build(data));
                this.changed();
            });
        };

        prompt(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, () => {
            this.runSetupAssistantIfEnabled(playerId);

            return { kind: 'claim' };
        });
        prompt(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, (data: { remainingUnits: number }) => {
            this.runSetupAssistantIfEnabled(playerId);

            return { kind: 'deploy-one', remaining: data.remainingUnits };
        });
        prompt(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, () => ({ kind: 'placement' }));
        prompt(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, () => ({ kind: 'attack' }));
        prompt(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, () => ({ kind: 'fortify' }));
        prompt(PLAYER_EVENTS.REQUIRE_DICE_ROLL, (data: { type: 'attacker' | 'defender'; maxDice: number }) => {
            if (this.autoRoll) {
                this.schedule(() => this.rollDice(data.maxDice, true), 0.5);
            }

            return { kind: 'dice', side: data.type, maxDice: data.maxDice };
        });

        listener.on(PLAYER_EVENTS.QUEUED_MOVE, (data: MoveJSON) => {
            this.queuedMoves.set(data.from, { from: data.from, to: data.to, units: data.units });
            this.changed();
        });

        listener.on(PLAYER_EVENTS.NEW_CARD, (data: { card: string }) => {
            this.notice = `${this.name(playerId)} received a card: ${this.describeCard(data.card)}`;
            this.changed();
        });
    }

    private describeCard(card: string): string {
        const type = card.split('_')[0];

        if (type === 'joker') {
            return 'Wild card';
        }

        return `${type[0].toUpperCase()}${type.slice(1)} · ${this.territoryName(card.slice(type.length + 1))}`;
    }

    private runSetupAssistantIfEnabled(playerId: string): void {
        if (this.autoSetup) {
            this.schedule(() => this.runSetupAssistant(playerId), 0.3);
        }
    }

    private runSetupAssistant(playerId: string): void {
        const assistant = this.assistants.get(playerId);
        const prompt = this.prompts.get(playerId);

        if (!assistant || !prompt || this.currentPlayerId !== playerId) {
            return;
        }

        if (prompt.kind === 'claim') {
            this.perform(id => this.game.act.claimTerritory(id, assistant.chooseClaim()));
        } else if (prompt.kind === 'deploy-one') {
            this.perform(id => this.game.act.deployOneUnit(id, assistant.chooseSetupDeploy()));
        }
    }

    private save(): void {
        if (this.disposed || this.game.isGameOver()) {
            return;
        }

        const saved: SavedGame = {
            version: 1,
            savedAt: Date.now(),
            config: this.config,
            state: this.game.state
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
        } catch {
            // storage unavailable
        }
    }
}
