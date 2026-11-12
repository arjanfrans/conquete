import { Component, escapeHtml } from '../core/component';

export interface PlayerRow {
    id: string;
    name: string;
    color: string;
    kind: 'human' | 'ai';
    territories: number;
    armies: number;
    cards: number;
    dead: boolean;
    current: boolean;
}

export interface ContinentRow {
    name: string;
    bonus: number;
    total: number;
    owner: { name: string; color: string } | null;
    shares: { color: string; count: number }[];
}

const styles = `
    :host { display: block; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    th { font-weight: 500; color: var(--text-muted); font-size: 11px; text-align: right; padding: 0 4px 4px; }
    th:first-child { text-align: left; }
    td { padding: 5px 4px; text-align: right; font-variant-numeric: tabular-nums; border-top: 1px solid var(--border); }
    td:first-child { text-align: left; }
    .name { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .name span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    tr.current td { background: var(--surface-2); }
    tr.current td:first-child { box-shadow: inset 3px 0 0 var(--accent); }
    tr.dead { opacity: .45; }
    tr.dead .label { text-decoration: line-through; }
    .tag { font-size: 10px; color: var(--text-muted); border: 1px solid var(--border); border-radius: 4px; padding: 0 4px; }
    .continents { margin-top: 18px; display: grid; gap: 8px; }
    .continent { font-size: 13px; }
    .continent .top { display: flex; justify-content: space-between; gap: 8px; }
    .bonus { color: var(--text-muted); }
    .owned { color: var(--text); font-weight: 600; }
    .meter { display: flex; height: 6px; margin-top: 4px; border-radius: 3px; overflow: hidden; background: var(--surface-3); }
    .meter span { height: 100%; }
`;

export class PlayerList extends Component {
    private players: PlayerRow[] = [];
    private continents: ContinentRow[] = [];

    constructor() {
        super(styles);
    }

    set model(model: { players: PlayerRow[]; continents: ContinentRow[] }) {
        this.players = model.players;
        this.continents = model.continents;
        this.render();
    }

    private render(): void {
        const rows = this.players.map(player => `
            <tr class="${player.current ? 'current' : ''} ${player.dead ? 'dead' : ''}">
                <td><div class="name"><span class="swatch" style="background:${player.color}"></span><span class="label">${escapeHtml(player.name)}</span>${player.kind === 'ai' ? '<span class="tag">AI</span>' : ''}</div></td>
                <td>${player.territories}</td>
                <td>${player.armies}</td>
                <td>${player.cards}</td>
            </tr>`).join('');

        const continents = this.continents.map(continent => `
            <div class="continent">
                <div class="top">
                    <span class="${continent.owner ? 'owned' : ''}">${escapeHtml(continent.name)}${continent.owner ? ` · ${escapeHtml(continent.owner.name)}` : ''}</span>
                    <span class="bonus">+${continent.bonus}</span>
                </div>
                <div class="meter">${continent.shares.map(share => `<span style="width:${(share.count / continent.total) * 100}%;background:${share.color}"></span>`).join('')}</div>
            </div>`).join('');

        this.renderHtml(`
            <h3>Players</h3>
            <table>
                <thead><tr><th>Player</th><th title="Territories">Terr.</th><th title="Armies">Armies</th><th title="Cards">Cards</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="continents">
                <h3>Continents</h3>
                ${continents}
            </div>
        `);
    }
}

customElements.define('cq-player-list', PlayerList);
