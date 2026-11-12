import { PLAYER_EVENTS, type ConqueteGame } from 'conquete';
import type { EventEmitter } from '../core/emitter';
import { AiStrategy } from './ai-strategy';

export interface Scheduler {
    schedule(task: () => void, delayFactor?: number): void;
}

const MAX_ATTACKS_PER_TURN = 20;

export class AiPlayer {
    private readonly strategy: AiStrategy;
    private attacksThisTurn = 0;

    constructor(
        private readonly game: ConqueteGame,
        private readonly playerId: string,
        listener: EventEmitter,
        private readonly scheduler: Scheduler
    ) {
        this.strategy = new AiStrategy(game, playerId);

        listener.on(PLAYER_EVENTS.REQUIRE_TERRITORY_CLAIM, () => this.run(() => this.claim()));
        listener.on(PLAYER_EVENTS.REQUIRE_ONE_UNIT_DEPLOY, () => this.run(() => this.deployOne()));
        listener.on(PLAYER_EVENTS.REQUIRE_PLACEMENT_ACTION, () => {
            this.attacksThisTurn = 0;
            this.run(() => this.place(), () => this.forcePlacement());
        });
        listener.on(PLAYER_EVENTS.REQUIRE_ATTACK_ACTION, () => this.run(() => this.attack(), () => this.game.act.fortifyPhase(this.playerId)));
        listener.on(PLAYER_EVENTS.REQUIRE_FORTIFY_ACTION, () => this.run(() => this.fortify(), () => this.game.act.endTurn(this.playerId)));
        listener.on(PLAYER_EVENTS.REQUIRE_DICE_ROLL, (data: { maxDice: number }) => {
            this.scheduler.schedule(() => this.game.act.rollDice(this.playerId, data.maxDice), 0.6);
        });
    }

    private run(task: () => void, fallback?: () => void): void {
        this.scheduler.schedule(() => {
            if (this.game.isGameOver() || this.game.currentPlayer?.id !== this.playerId) {
                return;
            }

            try {
                task();
            } catch (error) {
                console.warn(`AI ${this.playerId} action failed`, error);
                fallback?.();
            }
        });
    }

    private claim(): void {
        this.game.act.claimTerritory(this.playerId, this.strategy.chooseClaim());
    }

    private deployOne(): void {
        this.game.act.deployOneUnit(this.playerId, this.strategy.chooseSetupDeploy());
    }

    private place(): void {
        this.redeemAllCards();

        for (const placement of this.strategy.planPlacement(this.game.getAvailableUnits(this.playerId))) {
            this.game.act.deployUnits(this.playerId, placement.territoryId, placement.units);
        }

        this.game.act.attackPhase(this.playerId);
    }

    private forcePlacement(): void {
        this.redeemAllCards();

        const remaining = this.game.getAvailableUnits(this.playerId);
        const territoryId = this.game.getPlayer(this.playerId).territoryIds[0];

        if (remaining > 0 && territoryId) {
            this.game.act.deployUnits(this.playerId, territoryId, remaining);
        }

        this.game.act.attackPhase(this.playerId);
    }

    private redeemAllCards(): void {
        let combo = this.strategy.chooseCardsToRedeem(this.game.getCards(this.playerId));

        while (combo) {
            this.game.act.redeemCards(this.playerId, combo);
            combo = this.strategy.chooseCardsToRedeem(this.game.getCards(this.playerId));
        }
    }

    private attack(): void {
        const plan = this.attacksThisTurn < MAX_ATTACKS_PER_TURN ? this.strategy.chooseAttack() : null;

        if (!plan) {
            this.game.act.fortifyPhase(this.playerId);

            return;
        }

        this.attacksThisTurn += 1;
        this.game.act.attack(this.playerId, plan.from, plan.to, plan.units);
    }

    private fortify(): void {
        for (const move of this.strategy.planFortify()) {
            this.game.act.moveUnits(this.playerId, move.from, move.to, move.units);
        }

        this.game.act.endTurn(this.playerId);
    }
}
