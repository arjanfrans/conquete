export type PlayerKind = 'human' | 'ai';

export interface PlayerConfig {
    id: string;
    name: string;
    color: string;
    kind: PlayerKind;
}

export type AiSpeed = 'slow' | 'normal' | 'fast';

export interface SessionConfig {
    players: PlayerConfig[];
    aiSpeed: AiSpeed;
}

export const AI_DELAYS: Record<AiSpeed, number> = {
    slow: 900,
    normal: 400,
    fast: 60
};

export const PLAYER_COLORS: readonly { name: string; value: string }[] = [
    { name: 'Crimson', value: '#e0533d' },
    { name: 'Azure', value: '#3b82f6' },
    { name: 'Emerald', value: '#22a565' },
    { name: 'Amber', value: '#e8a317' },
    { name: 'Violet', value: '#9b5de5' },
    { name: 'Teal', value: '#14b8b8' }
];

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

export type Prompt =
    | { kind: 'claim' }
    | { kind: 'deploy-one'; remaining: number }
    | { kind: 'placement' }
    | { kind: 'attack' }
    | { kind: 'fortify' }
    | { kind: 'dice'; side: 'attacker' | 'defender'; maxDice: number };

export interface DiceRoll {
    attacker: number[];
    defender: number[];
    attackKilled: number;
    defendKilled: number;
}

export interface BattleOutcome {
    from: string;
    to: string;
    attacker: string;
    defender: string;
    winner: string;
    attackerUnits: number;
    defenderUnits: number;
    attackerLost: number;
    defenderLost: number;
}

export interface LogEntry {
    id: number;
    text: string;
    playerId: string | null;
    kind: 'info' | 'battle' | 'turn' | 'major';
}

export interface SavedGame {
    version: 1;
    savedAt: number;
    config: SessionConfig;
    state: unknown;
}
