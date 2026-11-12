export type Phase = 'setup_a' | 'setup_b' | 'battle' | 'end';
export type TurnPhase = 'placement' | 'attacking' | 'fortifying';

export interface TerritoryJSON {
    id: string;
    name: string;
    owner: string | null;
    units: number;
    continentId: string;
    adjacentTerritoryIds: string[];
}

export interface ContinentJSON {
    id: string;
    name: string;
    owner: string | null;
    bonus: number;
    territoryIds: string[];
    adjacentContinentIds: string[];
}

export interface PlayerJSON {
    id: string;
    dead: boolean;
    territoryIds: string[];
    cardsCount: number;
}

export interface FullPlayerJSON extends PlayerJSON {
    startUnits: number;
    cards: string[];
}

export interface BattleSideJSON {
    player: string;
    initialUnits: number;
    units: number;
    dice: number[];
}

export interface BattleJSON {
    from: string;
    to: string;
    players: [string, string];
    attacker: BattleSideJSON;
    defender: BattleSideJSON;
    turn: string;
    winner: string | null;
}

export interface MoveJSON {
    from: string;
    to: string;
    units: number;
}

export interface GameStateJSON {
    turnCount: number;
    phase: Phase;
    previousTurnEvent: unknown;
    previousPlayerEvent: unknown;
    turn: {
        movements: [string, MoveJSON][];
        phase: TurnPhase;
        player: string;
        unitsPlaced: number;
        cardBonus: number;
        battle: BattleJSON | null;
        wonBattle: boolean;
    };
    cardManager: unknown;
    players: FullPlayerJSON[];
    playerQueue: string[];
    board: {
        territories: TerritoryJSON[];
        continents: ContinentJSON[];
    };
}

export interface MapDefinition {
    territories: { id: string; name: string; continentId: string; adjacentTerritoryIds: string[] }[];
    continents: { id: string; name: string; bonus: number; territoryIds: string[] }[];
}

export interface CardBonus {
    cards: string[];
    bonus: number;
}

export interface Listener {
    on(event: string, handler: (data: any) => void): unknown;
    emit(event: string, data: unknown): unknown;
}

export interface GameOptions {
    map?: MapDefinition;
    debug?: boolean;
    listener: Listener;
    players: { id: string; listener: Listener }[];
    startUnits?: Record<number, number>;
    jokerCards?: number;
    cardBonus?: CardBonus[];
}

export interface ConqueteGame {
    readonly state: GameStateJSON;
    readonly phase: Phase;
    readonly turnPhase: TurnPhase;
    readonly battle: BattleJSON | null;
    readonly players: PlayerJSON[];
    readonly currentPlayer: PlayerJSON | null;
    readonly options: GameOptions & { cardBonus: CardBonus[] };
    start(): void;
    isStarted(): boolean;
    isGameOver(): boolean;
    getPlayer(playerId: string): PlayerJSON;
    getCards(playerId: string): string[];
    getAvailableUnits(playerId: string): number;
    board: {
        getTerritories(): TerritoryJSON[];
        getTerritory(territoryId: string): TerritoryJSON;
        getAvailableTerritories(): TerritoryJSON[];
        getAdjacentTerritories(territoryId: string, sameOwner: boolean): TerritoryJSON[];
        getContinents(): ContinentJSON[];
        getContinent(continentId: string): ContinentJSON;
    };
    act: {
        claimTerritory(playerId: string, territoryId: string): void;
        deployOneUnit(playerId: string, territoryId: string): void;
        deployUnits(playerId: string, territoryId: string, units: number): void;
        redeemCards(playerId: string, cards: string[]): void;
        attackPhase(playerId: string): void;
        attack(playerId: string, fromId: string, toId: string, units: number): void;
        rollDice(playerId: string, numberOfDice: number): void;
        fortifyPhase(playerId: string): void;
        moveUnits(playerId: string, fromId: string, toId: string, units: number): void;
        endTurn(playerId: string): void;
    };
    utils: {
        isValidCardCombo(cards: string[]): boolean;
        validCardCombos(): string[][];
    };
}

export function Game(options: GameOptions, state?: GameStateJSON | null): ConqueteGame;

export const maps: { classic(): MapDefinition };

export const PHASES: {
    SETUP_A: 'setup_a';
    SETUP_B: 'setup_b';
    BATTLE: 'battle';
    END: 'end';
};

export const TURN_PHASES: {
    PLACEMENT: 'placement';
    ATTACKING: 'attacking';
    FORTIFYING: 'fortifying';
};

export const GAME_EVENTS: {
    GAME_START: 'gameStart';
    TURN_CHANGE: 'turnChange';
    PHASE_CHANGE: 'phaseChange';
    TURN_PHASE_CHANGE: 'turnPhaseChange';
    TERRITORY_CLAIMED: 'territoryClaimed';
    DEPLOY_UNITS: 'deployUnits';
    ATTACK: 'attack';
    ATTACK_DICE_ROLL: 'attackDiceRoll';
    DEFEND_DICE_ROLL: 'defendDiceRoll';
    BATTLE_END: 'battleEnd';
    PLAYER_DEFEATED: 'playerDefeated';
    REDEEM_CARDS: 'redeemCards';
    MOVE_UNITS: 'moveUnits';
    GAME_END: 'gameEnd';
};

export const PLAYER_EVENTS: {
    REQUIRE_TERRITORY_CLAIM: 'requireTerritoryClaim';
    REQUIRE_ONE_UNIT_DEPLOY: 'requireOneUnitDeploy';
    REQUIRE_PLACEMENT_ACTION: 'requirePlacementAction';
    REQUIRE_ATTACK_ACTION: 'requireAttackAction';
    REQUIRE_FORTIFY_ACTION: 'requireForitfyAction';
    REQUIRE_DICE_ROLL: 'requireDiceRoll';
    QUEUED_MOVE: 'queuedMove';
    NEW_CARD: 'newCard';
};
