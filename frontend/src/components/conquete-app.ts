import type { ContinentJSON, GameStateJSON, TerritoryJSON } from 'conquete';
import { Component, escapeHtml } from '../core/component';
import { GameSession } from '../game/session';
import type { AiSpeed, PlayerConfig, Prompt, SessionConfig } from '../game/types';
import type { ActionButton, ActionPanel, ActionPanelModel, DeployAmount } from './action-panel';
import type { BattlePanel, BattlePanelModel, RollDetail } from './battle-panel';
import type { BoardArrow, BoardMap, TerritoryClickDetail, TerritoryMode, TerritoryView } from './board-map';
import type { CardHand, CardHandModel } from './card-hand';
import type { EventLog } from './event-log';
import type { NewGame } from './new-game';
import type { ContinentRow, PlayerList, PlayerRow } from './player-list';
import type { UnitDialog } from './unit-dialog';

type InteractionMode = 'none' | 'claim' | 'deploy-one' | 'deploy' | 'attack' | 'fortify';

interface RenderContext {
    session: GameSession;
    state: GameStateJSON;
    territories: Map<string, TerritoryJSON>;
    continents: Map<string, ContinentJSON>;
    human: PlayerConfig | null;
    prompt: Prompt | null;
    mode: InteractionMode;
}

const PHASE_STEPS = [
    { id: 'setup', label: 'Setup' },
    { id: 'placement', label: 'Reinforce' },
    { id: 'attacking', label: 'Attack' },
    { id: 'fortifying', label: 'Fortify' }
];

const styles = `
    :host {
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100vh;
        height: 100dvh;
        background: var(--bg);
        color: var(--text);
    }
    header {
        display: flex; align-items: center; gap: 16px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--surface-1);
        min-width: 0;
    }
    .brand { font-family: var(--font-display); font-size: 24px; letter-spacing: .02em; white-space: nowrap; }
    .phases { display: flex; gap: 4px; list-style: none; margin: 0; padding: 0; counter-reset: step; overflow-x: auto; }
    .phases li {
        font-size: 12px; padding: 5px 10px; border-radius: 999px; color: var(--text-muted);
        border: 1px solid transparent; white-space: nowrap;
    }
    .phases li.active { color: var(--accent-text); background: var(--accent); font-weight: 600; }
    .phases li.done { color: var(--text); border-color: var(--border); }
    .spacer { flex: 1; }
    .tools { display: flex; align-items: center; gap: 10px; }
    .tools label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
    select { font: inherit; color: var(--text); background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 5px 8px; }
    main { display: grid; grid-template-columns: minmax(0, 1fr) 360px; min-height: 0; }
    .board-area { position: relative; display: grid; min-height: 0; padding: 12px; }
    cq-board-map { width: 100%; height: 100%; }
    .battle {
        position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%);
        width: min(540px, calc(100% - 32px)); z-index: 3;
    }
    .toast {
        position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
        max-width: calc(100% - 32px);
        background: var(--surface-1); border: 1px solid var(--border-strong);
        border-left: 4px solid var(--accent);
        padding: 10px 14px; border-radius: 10px; font-size: 14px;
        box-shadow: 0 12px 30px rgba(0,0,0,.4); z-index: 4;
        animation: drop .2s ease;
    }
    .toast.error { border-left-color: var(--negative); }
    .toast[hidden] { display: none; }
    @keyframes drop { from { transform: translate(-50%, -8px); opacity: 0; } }
    aside {
        border-left: 1px solid var(--border);
        background: var(--surface-1);
        overflow-y: auto;
        display: flex; flex-direction: column;
    }
    aside section { padding: 16px; border-bottom: 1px solid var(--border); }
    aside section[hidden] { display: none; }
    .game-over {
        position: fixed; inset: 0; z-index: 15; display: grid; place-items: center; padding: 16px;
        background: rgba(3, 7, 15, .7); backdrop-filter: blur(3px);
    }
    .game-over[hidden] { display: none; }
    .game-over .card {
        background: var(--surface-1); border: 1px solid var(--border); border-radius: 18px;
        padding: 32px; text-align: center; width: min(420px, 100%);
        box-shadow: 0 30px 80px rgba(0,0,0,.55);
    }
    .game-over .crown { width: 64px; height: 64px; margin: 0 auto 8px; }
    .game-over h2 { font-family: var(--font-display); font-size: 30px; }
    .game-over p { color: var(--text-muted); }
    .game-over .buttons { display: flex; gap: 8px; justify-content: center; margin-top: 18px; }
    @media (max-width: 960px) {
        :host { height: auto; min-height: 100vh; }
        main { grid-template-columns: 1fr; }
        .board-area { padding: 8px 0; }
        cq-board-map { height: auto; }
        .battle { position: static; transform: none; width: auto; margin: 8px 16px 0; }
        aside { border-left: 0; border-top: 1px solid var(--border); overflow: visible; }
        .tools label span { display: none; }
    }
    @media (max-width: 640px) {
        header { flex-wrap: wrap; gap: 8px 12px; }
        .phases { order: 3; width: 100%; }
        .brand { font-size: 20px; }
    }
`;

export class ConqueteApp extends Component {
    private session: GameSession | null = null;
    private unsubscribe: (() => void) | null = null;
    private selection: string | null = null;
    private deployAmount: DeployAmount = 1;
    private toastText: string | null = null;
    private toastTimer: number | null = null;
    private gameOverDismissed = false;

    private readonly board: BoardMap;
    private readonly battlePanel: BattlePanel;
    private readonly actionPanel: ActionPanel;
    private readonly cardHand: CardHand;
    private readonly playerList: PlayerList;
    private readonly eventLog: EventLog;
    private readonly unitDialog: UnitDialog;
    private readonly newGame: NewGame;

    constructor() {
        super(styles);

        this.root.innerHTML = `
            <header>
                <div class="brand">Conquête</div>
                <ol class="phases">${PHASE_STEPS.map(step => `<li data-step="${step.id}">${step.label}</li>`).join('')}</ol>
                <div class="spacer"></div>
                <div class="tools">
                    <label><span>Computer speed</span>
                        <select class="speed" aria-label="Computer speed">
                            <option value="slow">Slow</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Fast</option>
                        </select>
                    </label>
                    <button class="menu">New game</button>
                </div>
            </header>
            <main>
                <section class="board-area">
                    <cq-board-map></cq-board-map>
                    <cq-battle-panel class="battle" hidden></cq-battle-panel>
                    <div class="toast" role="status" hidden></div>
                </section>
                <aside>
                    <section><cq-action-panel></cq-action-panel></section>
                    <section class="cards"><cq-card-hand></cq-card-hand></section>
                    <section><cq-player-list></cq-player-list></section>
                    <section><cq-event-log></cq-event-log></section>
                </aside>
            </main>
            <div class="game-over" hidden></div>
            <cq-unit-dialog></cq-unit-dialog>
            <cq-new-game></cq-new-game>
        `;

        const find = <T extends Element>(selector: string) => this.root.querySelector(selector) as T;

        this.board = find('cq-board-map');
        this.battlePanel = find('cq-battle-panel');
        this.actionPanel = find('cq-action-panel');
        this.cardHand = find('cq-card-hand');
        this.playerList = find('cq-player-list');
        this.eventLog = find('cq-event-log');
        this.unitDialog = find('cq-unit-dialog');
        this.newGame = find('cq-new-game');

        this.bindEvents();
    }

    connectedCallback(): void {
        this.newGame.savedGame = GameSession.loadSaved()?.savedAt ?? null;
    }

    private bindEvents(): void {
        this.newGame.addEventListener('start', event => this.startSession((event as CustomEvent<SessionConfig>).detail));
        this.newGame.addEventListener('resume', () => this.resumeSession());
        this.newGame.addEventListener('close', () => {
            this.newGame.hidden = true;
        });

        this.board.addEventListener('territory-click', event => {
            void this.handleTerritoryClick((event as CustomEvent<TerritoryClickDetail>).detail);
        });
        this.actionPanel.addEventListener('action', event => this.handleAction((event as CustomEvent<string>).detail));
        this.actionPanel.addEventListener('deploy-amount', event => {
            this.deployAmount = (event as CustomEvent<DeployAmount>).detail;
            this.render();
        });
        this.cardHand.addEventListener('redeem', event => this.session?.redeemCards((event as CustomEvent<string[]>).detail));
        this.battlePanel.addEventListener('roll', event => {
            const detail = (event as CustomEvent<RollDetail>).detail;

            this.session?.rollDice(detail.dice, detail.auto);
        });
        this.battlePanel.addEventListener('dismiss', () => this.session?.dismissOutcome());

        this.find<HTMLSelectElement>('.speed').addEventListener('change', event => {
            this.session?.setSpeed((event.target as HTMLSelectElement).value as AiSpeed);
        });
        this.find('.menu').addEventListener('click', () => this.showNewGame());
        this.find('.game-over').addEventListener('click', event => {
            const action = (event.target as Element).closest('button')?.dataset.action;

            if (action === 'new') {
                this.showNewGame();
            } else if (action === 'stay') {
                this.gameOverDismissed = true;
                this.render();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && this.selection) {
                this.selection = null;
                this.render();
            }
        });
    }

    private find<T extends Element = HTMLElement>(selector: string): T {
        return this.root.querySelector(selector) as T;
    }

    private showNewGame(): void {
        this.newGame.savedGame = GameSession.loadSaved()?.savedAt ?? null;
        this.newGame.closable = !!this.session && !this.session.winner;
        this.newGame.hidden = false;
    }

    private startSession(config: SessionConfig, savedState: GameStateJSON | null = null): void {
        this.unsubscribe?.();
        this.session?.dispose();

        const session = new GameSession(config, savedState);

        this.session = session;
        this.selection = null;
        this.gameOverDismissed = false;
        this.find<HTMLSelectElement>('.speed').value = config.aiSpeed;
        this.unsubscribe = session.subscribe(() => this.render());
        this.newGame.hidden = true;
        this.newGame.closable = false;
        session.start();
        this.render();
    }

    private resumeSession(): void {
        const saved = GameSession.loadSaved();

        if (!saved) {
            return;
        }

        try {
            this.startSession(saved.config, saved.state as GameStateJSON);
        } catch (error) {
            console.error(error);
            GameSession.clearSaved();
            this.session = null;
            this.newGame.savedGame = null;
            this.newGame.hidden = false;
            this.showToast('The saved game could not be loaded.', true);
        }
    }

    private context(): RenderContext | null {
        const session = this.session;

        if (!session) {
            return null;
        }

        const state = session.state;
        const human = session.winner ? null : session.activeHuman;
        const prompt = human ? session.prompts.get(human.id) ?? null : null;
        const modes: Record<Prompt['kind'], InteractionMode> = {
            'claim': 'claim',
            'deploy-one': 'deploy-one',
            'placement': 'deploy',
            'attack': 'attack',
            'fortify': 'fortify',
            'dice': 'none'
        };
        const mode = prompt && !state.turn.battle ? modes[prompt.kind] : 'none';

        return {
            session,
            state,
            human,
            prompt,
            mode,
            territories: new Map(state.board.territories.map(territory => [territory.id, territory])),
            continents: new Map(state.board.continents.map(continent => [continent.id, continent]))
        };
    }

    private render(): void {
        const context = this.context();

        if (!context) {
            return;
        }

        this.validateSelection(context);
        this.renderPhases(context);
        this.board.model = { territories: this.territoryViews(context), arrows: this.arrows(context) };
        this.renderBattle(context);
        this.actionPanel.model = this.actionModel(context);
        this.renderCards(context);
        this.playerList.model = { players: this.playerRows(context), continents: this.continentRows(context) };
        this.eventLog.entries = context.session.log.map(entry => ({
            id: entry.id,
            text: entry.text,
            kind: entry.kind,
            color: entry.playerId ? context.session.player(entry.playerId).color : null
        }));
        this.renderToast(context.session);
        this.renderGameOver(context.session);
    }

    private validateSelection(context: RenderContext): void {
        if (!this.selection) {
            return;
        }

        const selected = context.territories.get(this.selection);
        const valid = (context.mode === 'attack' || context.mode === 'fortify')
            && selected?.owner === context.human?.id
            && selected !== undefined
            && selected.units > 1;

        if (!valid) {
            this.selection = null;
        }
    }

    private renderPhases(context: RenderContext): void {
        const { phase, turn } = context.state;
        const active = phase === 'setup_a' || phase === 'setup_b' ? 'setup' : turn.phase;
        const order = PHASE_STEPS.map(step => step.id);
        const activeIndex = order.indexOf(active);

        this.root.querySelectorAll<HTMLLIElement>('.phases li').forEach(item => {
            const index = order.indexOf(item.dataset.step as string);

            item.classList.toggle('active', index === activeIndex);
            item.classList.toggle('done', phase === 'battle' && index > 0 && index < activeIndex);
        });
    }

    private territoryViews(context: RenderContext): TerritoryView[] {
        const { session, territories, continents } = context;

        return [...territories.values()].map(territory => {
            const owner = territory.owner ? session.player(territory.owner) : null;

            return {
                id: territory.id,
                name: territory.name,
                continentId: territory.continentId,
                continentName: continents.get(territory.continentId)?.name ?? '',
                ownerName: owner?.name ?? null,
                color: owner?.color ?? null,
                units: territory.units,
                mode: this.territoryMode(context, territory)
            };
        });
    }

    private territoryMode(context: RenderContext, territory: TerritoryJSON): TerritoryMode {
        const { human, mode, state, territories } = context;
        const battle = state.turn.battle;

        if (battle) {
            if (territory.id === battle.from) {
                return 'selected';
            }

            return territory.id === battle.to ? 'target' : 'dim';
        }

        if (!human) {
            return 'normal';
        }

        const own = territory.owner === human.id;
        const neighbours = territory.adjacentTerritoryIds.map(id => territories.get(id) as TerritoryJSON);
        const hasEnemyNeighbour = neighbours.some(n => n.owner !== human.id);
        const hasOwnNeighbour = neighbours.some(n => n.owner === human.id);

        switch (mode) {
            case 'claim':
                return territory.owner === null ? 'available' : 'dim';
            case 'deploy-one':
                return own ? 'available' : 'dim';
            case 'deploy':
                return own && this.availableUnits(context) > 0 ? 'available' : own ? 'normal' : 'dim';
            case 'attack':
                if (this.selection) {
                    if (territory.id === this.selection) {
                        return 'selected';
                    }

                    if (!own && territory.adjacentTerritoryIds.includes(this.selection)) {
                        return 'target';
                    }

                    return own ? 'normal' : 'dim';
                }

                return own && territory.units > 1 && hasEnemyNeighbour ? 'available' : 'dim';
            case 'fortify':
                if (this.selection) {
                    if (territory.id === this.selection) {
                        return 'selected';
                    }

                    return own && territory.adjacentTerritoryIds.includes(this.selection) ? 'target' : 'dim';
                }

                return own && territory.units > 1 && hasOwnNeighbour ? 'available' : 'dim';
            default:
                return 'normal';
        }
    }

    private arrows(context: RenderContext): BoardArrow[] {
        const battle = context.state.turn.battle;

        if (battle) {
            return [{ from: battle.from, to: battle.to, kind: 'attack' }];
        }

        if (context.state.phase !== 'battle' || context.state.turn.phase !== 'fortifying') {
            return [];
        }

        return [...context.session.queuedMoves.values()].map(move => ({
            from: move.from,
            to: move.to,
            kind: 'move',
            label: String(move.units)
        }));
    }

    private availableUnits(context: RenderContext): number {
        return context.human ? context.session.game.getAvailableUnits(context.human.id) : 0;
    }

    private actionModel(context: RenderContext): ActionPanelModel {
        const { session, state, human, mode, territories } = context;
        const current = session.player(state.turn.player);
        const base = {
            playerName: current.name,
            playerColor: current.color,
            reinforcements: null,
            deployAmount: null,
            buttons: [] as ActionButton[],
            details: [] as string[],
            thinking: false
        };

        if (session.winner) {
            const winner = session.player(session.winner);

            return { ...base, playerName: winner.name, playerColor: winner.color, title: 'Victory', message: 'The war is over.', buttons: [{ id: 'new-game', label: 'New game', primary: true }] };
        }

        if (state.turn.battle) {
            const battle = state.turn.battle;

            return {
                ...base,
                title: 'Battle',
                message: `Battle for ${territories.get(battle.to)?.name}: ${session.player(battle.attacker.player).name} against ${session.player(battle.defender.player).name}.`,
                thinking: !human
            };
        }

        if (!human) {
            const viewer = session.viewer;
            const viewerDead = viewer ? state.players.find(player => player.id === viewer.id)?.dead : false;

            return {
                ...base,
                title: this.phaseTitle(state),
                message: viewerDead
                    ? `${viewer?.name} has been eliminated. Watching the rest of the war…`
                    : `${current.name} is planning their move…`,
                thinking: true
            };
        }

        const selected = this.selection ? territories.get(this.selection) : undefined;
        const setupButtons: ActionButton[] = [{ id: 'auto-setup', label: 'Auto-setup', title: 'Let the computer finish setup for all human players' }];

        switch (mode) {
            case 'claim':
                return { ...base, title: 'Setup · Claim', message: 'Choose an unclaimed territory to claim it.', reinforcements: this.availableUnits(context), buttons: setupButtons };
            case 'deploy-one':
                return { ...base, title: 'Setup · Reinforce', message: 'Place one army on one of your territories.', reinforcements: this.availableUnits(context), buttons: setupButtons };
            case 'deploy': {
                const available = this.availableUnits(context);
                const tooManyCards = session.game.getCards(human.id).length > 4;

                return {
                    ...base,
                    title: 'Reinforce',
                    message: available > 0
                        ? 'Click your territories to deploy armies. Shift-click deploys everything at once.'
                        : tooManyCards ? 'Trade in a card set before attacking.' : 'All armies deployed. On to battle!',
                    reinforcements: available,
                    deployAmount: available > 0 ? this.deployAmount : null,
                    buttons: [{
                        id: 'attack-phase',
                        label: 'Start attacking',
                        primary: true,
                        disabled: available > 0 || tooManyCards,
                        title: available > 0 ? 'Deploy all armies first' : ''
                    }]
                };
            }
            case 'attack':
                return {
                    ...base,
                    title: 'Attack',
                    message: selected
                        ? `Attacking from ${selected.name} with up to ${selected.units - 1} armies. Pick an adjacent enemy territory.`
                        : 'Select one of your territories with at least 2 armies, next to an enemy.',
                    buttons: [
                        ...(selected ? [{ id: 'cancel', label: 'Cancel' }] : []),
                        { id: 'fortify-phase', label: 'Stop attacking', primary: true }
                    ]
                };
            case 'fortify': {
                const moves = [...session.queuedMoves.values()].map(move => {
                    return `${move.units} from ${territories.get(move.from)?.name} to ${territories.get(move.to)?.name}`;
                });

                return {
                    ...base,
                    title: 'Fortify',
                    message: selected
                        ? `Move armies out of ${selected.name}: pick an adjacent territory you own.`
                        : 'Select a territory to move armies from. Moves happen when you end your turn (one move per territory).',
                    details: moves,
                    buttons: [
                        ...(selected ? [{ id: 'cancel', label: 'Cancel' }] : []),
                        { id: 'end-turn', label: 'End turn', primary: true }
                    ]
                };
            }
            default:
                return { ...base, title: this.phaseTitle(state), message: 'Waiting…' };
        }
    }

    private phaseTitle(state: GameStateJSON): string {
        if (state.phase === 'setup_a') {
            return 'Setup · Claim';
        }

        if (state.phase === 'setup_b') {
            return 'Setup · Reinforce';
        }

        return PHASE_STEPS.find(step => step.id === state.turn.phase)?.label ?? '';
    }

    private renderBattle(context: RenderContext): void {
        const model = this.battleModel(context);

        this.battlePanel.hidden = !model;

        if (model) {
            this.battlePanel.model = model;
        }
    }

    private battleModel(context: RenderContext): BattlePanelModel | null {
        const { session, state, territories, human, prompt } = context;
        const battle = state.turn.battle;
        const side = (playerId: string, territoryId: string, units: number, initialUnits: number) => {
            const player = session.player(playerId);

            return { name: player.name, color: player.color, territory: territories.get(territoryId)?.name ?? '', units, initialUnits };
        };

        if (battle) {
            const actor = session.player(battle.turn);

            return {
                attacker: side(battle.attacker.player, battle.from, battle.attacker.units, battle.attacker.initialUnits),
                defender: side(battle.defender.player, battle.to, battle.defender.units, battle.defender.initialUnits),
                roll: session.lastRoll,
                outcome: null,
                rollPrompt: human && prompt?.kind === 'dice' && !session.autoRoll
                    ? { side: prompt.side, maxDice: prompt.maxDice, playerName: human.name }
                    : null,
                waitingFor: actor.kind === 'ai' ? actor.name : session.autoRoll ? `${actor.name} (auto)` : actor.name
            };
        }

        const outcome = session.lastOutcome;

        if (!outcome) {
            return null;
        }

        const attackerWon = outcome.winner === outcome.attacker;
        const involvesHuman = session.isHuman(outcome.attacker) || session.isHuman(outcome.defender);
        const toName = territories.get(outcome.to)?.name ?? '';

        return {
            attacker: side(outcome.attacker, outcome.from, outcome.attackerUnits - outcome.attackerLost, outcome.attackerUnits),
            defender: side(outcome.defender, outcome.to, outcome.defenderUnits - outcome.defenderLost, outcome.defenderUnits),
            roll: session.lastRoll,
            outcome: {
                title: attackerWon
                    ? `${toName} conquered by ${session.player(outcome.attacker).name}!`
                    : `${toName} held by ${session.player(outcome.defender).name}!`,
                detail: `Attacker lost ${outcome.attackerLost}, defender lost ${outcome.defenderLost}.`,
                victory: involvesHuman ? session.isHuman(outcome.winner) : attackerWon
            },
            rollPrompt: null,
            waitingFor: null
        };
    }

    private renderCards(context: RenderContext): void {
        const section = this.find('.cards');
        const viewer = context.session.viewer;

        section.hidden = !viewer;

        if (viewer) {
            this.cardHand.model = this.cardModel(context, viewer);
        }
    }

    private cardModel(context: RenderContext, viewer: PlayerConfig): CardHandModel {
        const { session, territories, human, mode } = context;
        const cards = session.game.getCards(viewer.id);
        const canRedeem = human?.id === viewer.id && mode === 'deploy';

        return {
            ownerName: viewer.name,
            cards: cards.map(card => {
                const type = card.split('_')[0];
                const territoryId = card.slice(type.length + 1);

                return { id: card, type, label: type === 'joker' ? 'Wild card' : territories.get(territoryId)?.name ?? territoryId };
            }),
            canRedeem,
            mustRedeem: canRedeem && cards.length > 4,
            combos: session.game.options.cardBonus,
            isValidCombo: combo => session.game.utils.isValidCardCombo(combo)
        };
    }

    private playerRows(context: RenderContext): PlayerRow[] {
        const { session, state, territories } = context;

        return session.config.players.map(config => {
            const player = state.players.find(candidate => candidate.id === config.id);
            const owned = player?.territoryIds ?? [];

            return {
                id: config.id,
                name: config.name,
                color: config.color,
                kind: config.kind,
                territories: owned.length,
                armies: owned.reduce((sum, id) => sum + (territories.get(id)?.units ?? 0), 0),
                cards: player?.cardsCount ?? 0,
                dead: !!player?.dead,
                current: state.turn.player === config.id && !session.winner
            };
        });
    }

    private continentRows(context: RenderContext): ContinentRow[] {
        const { session, territories, continents } = context;

        return [...continents.values()].map(continent => {
            const counts = new Map<string, number>();

            for (const id of continent.territoryIds) {
                const owner = territories.get(id)?.owner;

                if (owner) {
                    counts.set(owner, (counts.get(owner) ?? 0) + 1);
                }
            }

            const owner = continent.owner ? session.player(continent.owner) : null;

            return {
                name: continent.name,
                bonus: continent.bonus,
                total: continent.territoryIds.length,
                owner: owner ? { name: owner.name, color: owner.color } : null,
                shares: session.config.players
                    .filter(player => counts.has(player.id))
                    .map(player => ({ color: player.color, count: counts.get(player.id) as number }))
            };
        });
    }

    private async handleTerritoryClick(detail: TerritoryClickDetail): Promise<void> {
        const context = this.context();

        if (!context || !context.human) {
            return;
        }

        const { session, territories, human, mode } = context;
        const territory = territories.get(detail.id);

        if (!territory) {
            return;
        }

        const own = territory.owner === human.id;

        switch (mode) {
            case 'claim':
                if (territory.owner === null) {
                    session.claimTerritory(territory.id);
                }
                break;
            case 'deploy-one':
                if (own) {
                    session.deployOneUnit(territory.id);
                }
                break;
            case 'deploy': {
                const available = this.availableUnits(context);

                if (own && available > 0) {
                    const amount = detail.shiftKey || this.deployAmount === 'all' ? available : Math.min(this.deployAmount, available);

                    session.deployUnits(territory.id, amount);
                }
                break;
            }
            case 'attack':
                await this.handleAttackClick(context, territory);
                break;
            case 'fortify':
                await this.handleFortifyClick(context, territory);
                break;
        }

        this.render();
    }

    private async handleAttackClick(context: RenderContext, territory: TerritoryJSON): Promise<void> {
        const { session, territories, human } = context;
        const from = this.selection ? territories.get(this.selection) : undefined;

        if (territory.owner === human?.id) {
            if (territory.id === this.selection) {
                this.selection = null;
            } else if (territory.units < 2) {
                this.showToast(`${territory.name} needs at least 2 armies to attack.`);
            } else if (!territory.adjacentTerritoryIds.some(id => territories.get(id)?.owner !== human.id)) {
                this.showToast(`${territory.name} has no enemy neighbours.`);
            } else {
                this.selection = territory.id;
            }

            return;
        }

        if (!from || !from.adjacentTerritoryIds.includes(territory.id)) {
            this.selection = null;

            return;
        }

        const units = await this.unitDialog.request({
            title: `Attack ${territory.name}`,
            description: `From ${from.name}. Committed armies fight until they or the ${territory.units} defenders are wiped out; survivors occupy the territory.`,
            confirmLabel: 'Attack',
            min: 1,
            max: from.units - 1,
            value: from.units - 1
        });

        if (units !== null) {
            this.selection = null;
            session.attack(from.id, territory.id, units);
        }
    }

    private async handleFortifyClick(context: RenderContext, territory: TerritoryJSON): Promise<void> {
        const { session, territories, human } = context;
        const from = this.selection ? territories.get(this.selection) : undefined;

        if (territory.owner !== human?.id) {
            this.selection = null;

            return;
        }

        if (from && territory.id !== from.id && from.adjacentTerritoryIds.includes(territory.id)) {
            const units = await this.unitDialog.request({
                title: `Move to ${territory.name}`,
                description: `From ${from.name}. At least one army must stay behind. Replaces any earlier move from ${from.name}.`,
                confirmLabel: 'Queue move',
                min: 1,
                max: from.units - 1,
                value: from.units - 1
            });

            if (units !== null) {
                this.selection = null;
                session.moveUnits(from.id, territory.id, units);
            }

            return;
        }

        if (territory.id === this.selection) {
            this.selection = null;
        } else if (territory.units < 2) {
            this.showToast(`${territory.name} needs at least 2 armies to move troops out.`);
        } else {
            this.selection = territory.id;
        }
    }

    private handleAction(action: string): void {
        const session = this.session;

        if (!session) {
            return;
        }

        switch (action) {
            case 'auto-setup':
                session.enableAutoSetup();
                break;
            case 'attack-phase':
                session.toAttackPhase();
                break;
            case 'fortify-phase':
                this.selection = null;
                session.toFortifyPhase();
                break;
            case 'end-turn':
                this.selection = null;
                session.endTurn();
                break;
            case 'cancel':
                this.selection = null;
                break;
            case 'new-game':
                this.showNewGame();
                break;
        }

        this.render();
    }

    private showToast(text: string, isError = false): void {
        const toast = this.find('.toast');

        toast.textContent = text;
        toast.classList.toggle('error', isError);
        toast.hidden = false;

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastTimer = window.setTimeout(() => {
            toast.hidden = true;
            this.toastText = null;
            this.session?.clearError();
        }, 3500);
    }

    private renderToast(session: GameSession): void {
        const text = session.error ?? session.notice;

        if (text && text !== this.toastText) {
            this.toastText = text;
            this.showToast(text, !!session.error);
        }
    }

    private renderGameOver(session: GameSession): void {
        const overlay = this.find('.game-over');
        const show = !!session.winner && !this.gameOverDismissed;

        overlay.hidden = !show;

        if (!show || !session.winner) {
            return;
        }

        const winner = session.player(session.winner);
        const title = winner.kind === 'human' ? 'World conquered!' : `${winner.name} conquered the world`;

        overlay.innerHTML = `
            <div class="card">
                <svg class="crown" viewBox="0 0 64 64" aria-hidden="true">
                    <path d="M8 48l-4-30 16 12L32 10l12 20 16-12-4 30z" fill="${winner.color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
                    <rect x="8" y="50" width="48" height="6" rx="2" fill="${winner.color}" stroke="#fff" stroke-width="2"/>
                </svg>
                <h2>${escapeHtml(title)}</h2>
                <p>${winner.kind === 'human' ? `Glorious victory for ${escapeHtml(winner.name)}.` : 'Better luck next campaign.'}</p>
                <div class="buttons">
                    <button class="ghost" data-action="stay">View map</button>
                    <button class="primary" data-action="new">New game</button>
                </div>
            </div>`;
    }
}

customElements.define('cq-app', ConqueteApp);
