import type { ConqueteGame, ContinentJSON, MoveJSON, TerritoryJSON } from 'conquete';

export interface Placement {
    territoryId: string;
    units: number;
}

export interface AttackPlan {
    from: string;
    to: string;
    units: number;
}

interface Snapshot {
    territories: Map<string, TerritoryJSON>;
    continents: Map<string, ContinentJSON>;
}

function pickBest<T>(items: T[], score: (item: T) => number): T | null {
    let best: T | null = null;
    let bestScore = -Infinity;

    for (const item of items) {
        const value = score(item);

        if (value > bestScore) {
            best = item;
            bestScore = value;
        }
    }

    return best;
}

function combinationsOfThree<T>(items: T[]): T[][] {
    const result: T[][] = [];

    for (let a = 0; a < items.length; a++) {
        for (let b = a + 1; b < items.length; b++) {
            for (let c = b + 1; c < items.length; c++) {
                result.push([items[a], items[b], items[c]]);
            }
        }
    }

    return result;
}

const jitter = (amount: number): number => Math.random() * amount;

export class AiStrategy {
    constructor(private readonly game: ConqueteGame, private readonly playerId: string) {}

    chooseClaim(): string {
        const snapshot = this.snapshot();
        const available = [...snapshot.territories.values()].filter(territory => territory.owner === null);
        const best = pickBest(available, territory => {
            const continent = snapshot.continents.get(territory.continentId);
            const continentSize = continent ? continent.territoryIds.length : 6;

            return 4 * this.continentShare(snapshot, territory.continentId)
                + 1.5 * this.neighbours(snapshot, territory).filter(n => n.owner === this.playerId).length
                + 6 / continentSize
                + jitter(1.5);
        });

        if (!best) {
            throw new Error('No territory available to claim');
        }

        return best.id;
    }

    chooseSetupDeploy(): string {
        const snapshot = this.snapshot();
        const own = this.ownTerritories(snapshot);
        const borders = own.filter(territory => this.enemyNeighbours(snapshot, territory).length > 0);
        const best = pickBest(borders.length ? borders : own, territory => {
            return this.threat(snapshot, territory) - territory.units
                + 2 * this.continentShare(snapshot, territory.continentId)
                + jitter(2);
        });

        if (!best) {
            throw new Error('No own territory to deploy on');
        }

        return best.id;
    }

    chooseCardsToRedeem(cards: string[]): string[] | null {
        const combos = combinationsOfThree(cards).filter(combo => this.game.utils.isValidCardCombo(combo));
        const withoutJokers = combos.find(combo => combo.every(card => !card.startsWith('joker')));

        return withoutJokers ?? combos[0] ?? null;
    }

    planPlacement(units: number): Placement[] {
        const snapshot = this.snapshot();
        const own = this.ownTerritories(snapshot);
        const borders = own.filter(territory => this.enemyNeighbours(snapshot, territory).length > 0);
        const candidates = borders.length ? borders : own;
        const assigned = new Map<string, number>();
        const front = pickBest(candidates, territory => this.opportunity(snapshot, territory) + jitter(1));

        if (!front) {
            return [];
        }

        const frontUnits = Math.ceil(units * 0.6);

        assigned.set(front.id, frontUnits);

        for (let remaining = units - frontUnits; remaining > 0; remaining--) {
            const target = pickBest(candidates, territory => {
                return this.threat(snapshot, territory) - territory.units - (assigned.get(territory.id) ?? 0) + jitter(0.5);
            });

            if (target) {
                assigned.set(target.id, (assigned.get(target.id) ?? 0) + 1);
            }
        }

        return [...assigned.entries()].map(([territoryId, count]) => ({ territoryId, units: count }));
    }

    chooseAttack(): AttackPlan | null {
        const snapshot = this.snapshot();
        const options: { plan: AttackPlan; score: number }[] = [];

        for (const from of this.ownTerritories(snapshot)) {
            const attackers = from.units - 1;

            if (attackers < 1) {
                continue;
            }

            for (const target of this.enemyNeighbours(snapshot, from)) {
                const ratio = attackers / target.units;
                const favourable = attackers >= target.units + 2 || (ratio >= 2 && attackers >= 2);

                if (!favourable) {
                    continue;
                }

                const continent = snapshot.continents.get(target.continentId);
                const missing = continent
                    ? continent.territoryIds.filter(id => snapshot.territories.get(id)?.owner !== this.playerId).length
                    : 99;

                options.push({
                    plan: { from: from.id, to: target.id, units: attackers },
                    score: ratio
                        + 2 * this.continentShare(snapshot, target.continentId)
                        + (missing === 1 ? 3 : 0)
                        + (this.isNearlyDead(snapshot, target.owner) ? 2 : 0)
                        + jitter(0.5)
                });
            }
        }

        return pickBest(options, option => option.score)?.plan ?? null;
    }

    planFortify(): MoveJSON[] {
        const snapshot = this.snapshot();
        const distances = this.distanceToFront(snapshot);
        const moves: MoveJSON[] = [];

        for (const territory of this.ownTerritories(snapshot)) {
            if (territory.units < 2 || this.enemyNeighbours(snapshot, territory).length > 0) {
                continue;
            }

            const ownDistance = distances.get(territory.id) ?? Infinity;
            const closer = pickBest(
                this.neighbours(snapshot, territory).filter(n => n.owner === this.playerId),
                n => -(distances.get(n.id) ?? Infinity)
            );

            if (closer && (distances.get(closer.id) ?? Infinity) < ownDistance) {
                moves.push({ from: territory.id, to: closer.id, units: territory.units - 1 });
            }
        }

        return moves;
    }

    private snapshot(): Snapshot {
        const state = this.game.state;

        return {
            territories: new Map(state.board.territories.map(territory => [territory.id, territory])),
            continents: new Map(state.board.continents.map(continent => [continent.id, continent]))
        };
    }

    private ownTerritories(snapshot: Snapshot): TerritoryJSON[] {
        return [...snapshot.territories.values()].filter(territory => territory.owner === this.playerId);
    }

    private neighbours(snapshot: Snapshot, territory: TerritoryJSON): TerritoryJSON[] {
        return territory.adjacentTerritoryIds
            .map(id => snapshot.territories.get(id))
            .filter((neighbour): neighbour is TerritoryJSON => neighbour !== undefined);
    }

    private enemyNeighbours(snapshot: Snapshot, territory: TerritoryJSON): TerritoryJSON[] {
        return this.neighbours(snapshot, territory).filter(n => n.owner !== null && n.owner !== this.playerId);
    }

    private continentShare(snapshot: Snapshot, continentId: string): number {
        const continent = snapshot.continents.get(continentId);

        if (!continent) {
            return 0;
        }

        const owned = continent.territoryIds.filter(id => snapshot.territories.get(id)?.owner === this.playerId).length;

        return owned / continent.territoryIds.length;
    }

    private threat(snapshot: Snapshot, territory: TerritoryJSON): number {
        return this.enemyNeighbours(snapshot, territory).reduce((sum, enemy) => sum + enemy.units, 0);
    }

    private opportunity(snapshot: Snapshot, territory: TerritoryJSON): number {
        const enemies = this.enemyNeighbours(snapshot, territory);

        if (!enemies.length) {
            return -Infinity;
        }

        return Math.max(...enemies.map(enemy => {
            return territory.units - enemy.units + 4 * this.continentShare(snapshot, enemy.continentId);
        }));
    }

    private isNearlyDead(snapshot: Snapshot, playerId: string | null): boolean {
        if (!playerId) {
            return false;
        }

        return [...snapshot.territories.values()].filter(territory => territory.owner === playerId).length <= 2;
    }

    private distanceToFront(snapshot: Snapshot): Map<string, number> {
        const distances = new Map<string, number>();
        const queue: TerritoryJSON[] = [];

        for (const territory of this.ownTerritories(snapshot)) {
            if (this.enemyNeighbours(snapshot, territory).length > 0) {
                distances.set(territory.id, 0);
                queue.push(territory);
            }
        }

        while (queue.length) {
            const current = queue.shift() as TerritoryJSON;
            const distance = distances.get(current.id) as number;

            for (const neighbour of this.neighbours(snapshot, current)) {
                if (neighbour.owner === this.playerId && !distances.has(neighbour.id)) {
                    distances.set(neighbour.id, distance + 1);
                    queue.push(neighbour);
                }
            }
        }

        return distances;
    }
}
