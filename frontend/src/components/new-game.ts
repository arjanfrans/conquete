import { Component, escapeHtml } from '../core/component';
import {
    MAX_PLAYERS,
    MIN_PLAYERS,
    PLAYER_COLORS,
    type AiSpeed,
    type PlayerConfig,
    type SessionConfig
} from '../game/types';

const AI_NAMES = ['Napoleon', 'Catherine', 'Genghis', 'Cleopatra', 'Bismarck', 'Hannibal', 'Boudica', 'Saladin'];

const styles = `
    :host {
        position: fixed; inset: 0; z-index: 20;
        display: grid; place-items: center;
        padding: 16px;
        background: radial-gradient(ellipse at 50% 30%, rgba(30, 64, 120, .55), rgba(3, 7, 15, .92));
        backdrop-filter: blur(3px);
        overflow-y: auto;
    }
    :host([hidden]) { display: none; }
    .card {
        width: min(560px, 100%);
        background: var(--surface-1);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 28px;
        box-shadow: 0 30px 80px rgba(0,0,0,.55);
    }
    h1 { margin: 0; font-family: var(--font-display); font-size: 40px; letter-spacing: .02em; }
    .tagline { margin: 4px 0 22px; color: var(--text-muted); }
    .players { display: grid; gap: 8px; margin-top: 10px; }
    .player { display: grid; grid-template-columns: auto 1fr auto auto; gap: 8px; align-items: center; }
    .color { width: 30px; height: 30px; border-radius: 50%; padding: 0; border: 2px solid rgba(255,255,255,.35); }
    .color:hover:not(:disabled) { border-color: #fff; }
    input[type=text], select {
        font: inherit; color: var(--text);
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 7px 10px;
        min-width: 0;
    }
    .remove { padding: 6px 10px; }
    .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-top: 16px; }
    label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; margin-top: 24px; }
    .actions button { padding: 10px 18px; }
    details { margin-top: 20px; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
    summary { cursor: pointer; color: var(--text); }
    ol { padding-left: 18px; margin: 8px 0 0; }
    @media (max-width: 480px) {
        .card { padding: 20px; }
        h1 { font-size: 32px; }
        .player { grid-template-columns: auto 1fr auto; }
        .remove { grid-column: 3; }
    }
`;

export class NewGame extends Component {
    private players: PlayerConfig[] = [];
    private speed: AiSpeed = 'normal';
    private savedAt: number | null = null;
    private canClose = false;

    constructor() {
        super(styles);
        this.reset();

        this.root.addEventListener('click', event => this.handleClick(event));
        this.root.addEventListener('change', event => this.handleChange(event));
        this.root.addEventListener('input', event => {
            const input = event.target as HTMLInputElement;

            if (input.dataset.name !== undefined) {
                this.players[Number(input.dataset.name)].name = input.value;
            }
        });
    }

    set savedGame(savedAt: number | null) {
        this.savedAt = savedAt;
        this.render();
    }

    set closable(value: boolean) {
        this.canClose = value;
        this.render();
    }

    private reset(): void {
        const names = [...AI_NAMES].sort(() => Math.random() - 0.5);

        this.players = [
            { id: '1', name: 'You', color: PLAYER_COLORS[0].value, kind: 'human' },
            { id: '2', name: names[0], color: PLAYER_COLORS[1].value, kind: 'ai' },
            { id: '3', name: names[1], color: PLAYER_COLORS[2].value, kind: 'ai' }
        ];
        this.render();
    }

    private nextFreeColor(after: string): string {
        const used = new Set(this.players.map(player => player.color));
        const start = PLAYER_COLORS.findIndex(color => color.value === after);

        for (let offset = 1; offset <= PLAYER_COLORS.length; offset++) {
            const candidate = PLAYER_COLORS[(start + offset) % PLAYER_COLORS.length].value;

            if (!used.has(candidate)) {
                return candidate;
            }
        }

        return after;
    }

    private handleClick(event: Event): void {
        const button = (event.target as Element).closest('button');

        if (!button) {
            return;
        }

        const index = Number(button.dataset.index);

        switch (button.dataset.action) {
            case 'color':
                this.players[index].color = this.nextFreeColor(this.players[index].color);
                this.render();
                break;
            case 'remove':
                this.players.splice(index, 1);
                this.render();
                break;
            case 'add': {
                const usedNames = new Set(this.players.map(player => player.name));

                this.players.push({
                    id: '',
                    name: AI_NAMES.find(name => !usedNames.has(name)) ?? `AI ${this.players.length}`,
                    color: this.nextFreeColor(this.players[this.players.length - 1].color),
                    kind: 'ai'
                });
                this.render();
                break;
            }
            case 'start':
                this.emit<SessionConfig>('start', this.buildConfig());
                break;
            case 'resume':
                this.emit('resume');
                break;
            case 'close':
                this.emit('close');
                break;
        }
    }

    private handleChange(event: Event): void {
        const target = event.target as HTMLSelectElement;

        if (target.dataset.kind !== undefined) {
            this.players[Number(target.dataset.kind)].kind = target.value as PlayerConfig['kind'];
        } else if (target.name === 'speed') {
            this.speed = target.value as AiSpeed;
        }
    }

    private buildConfig(): SessionConfig {
        return {
            aiSpeed: this.speed,
            players: this.players.map((player, index) => ({
                ...player,
                id: String(index + 1),
                name: player.name.trim() || `Player ${index + 1}`
            }))
        };
    }

    private render(): void {
        const rows = this.players.map((player, index) => `
            <div class="player">
                <button class="color" data-action="color" data-index="${index}" style="background:${player.color}" title="Change colour" aria-label="Change colour"></button>
                <input type="text" data-name="${index}" value="${escapeHtml(player.name)}" maxlength="16" aria-label="Player name">
                <select data-kind="${index}" aria-label="Controller">
                    <option value="human" ${player.kind === 'human' ? 'selected' : ''}>Human</option>
                    <option value="ai" ${player.kind === 'ai' ? 'selected' : ''}>Computer</option>
                </select>
                <button class="remove ghost" data-action="remove" data-index="${index}" ${this.players.length <= MIN_PLAYERS ? 'disabled' : ''} aria-label="Remove player">✕</button>
            </div>`).join('');

        const saved = this.savedAt
            ? `<button data-action="resume">Continue saved game <span class="muted">(${new Date(this.savedAt).toLocaleString()})</span></button>`
            : '';

        this.root.innerHTML = `
            <div class="card">
                <h1>Conquête</h1>
                <p class="tagline">Command your armies. Conquer the world.</p>
                <h3>Players (${MIN_PLAYERS}–${MAX_PLAYERS})</h3>
                <div class="players">${rows}</div>
                <div class="row">
                    <button data-action="add" ${this.players.length >= MAX_PLAYERS ? 'disabled' : ''}>+ Add player</button>
                    <label>Computer speed
                        <select name="speed">
                            ${(['slow', 'normal', 'fast'] as AiSpeed[]).map(speed => `<option value="${speed}" ${speed === this.speed ? 'selected' : ''}>${speed[0].toUpperCase()}${speed.slice(1)}</option>`).join('')}
                        </select>
                    </label>
                </div>
                <details>
                    <summary>How to play</summary>
                    <ol>
                        <li><strong>Setup:</strong> take turns claiming territories, then place your remaining armies one at a time. “Auto-setup” does this for you.</li>
                        <li><strong>Reinforce:</strong> you get armies for territories held (min. 3), whole continents and traded card sets. Click your territories to deploy.</li>
                        <li><strong>Attack:</strong> pick one of your territories, then an adjacent enemy. Commit armies and roll dice until one side is wiped out.</li>
                        <li><strong>Fortify:</strong> move armies between adjacent territories you own. Moves happen when you end your turn.</li>
                        <li>Conquer at least one territory in a turn to earn a card. Eliminate everyone to win.</li>
                    </ol>
                </details>
                <div class="actions">
                    ${this.canClose ? '<button class="ghost" data-action="close">Back to game</button>' : saved}
                    <button class="primary" data-action="start">Start new game</button>
                </div>
            </div>`;
    }
}

customElements.define('cq-new-game', NewGame);
