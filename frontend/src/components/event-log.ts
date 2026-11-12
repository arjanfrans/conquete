import { Component, escapeHtml } from '../core/component';

export interface LogRow {
    id: number;
    text: string;
    color: string | null;
    kind: 'info' | 'battle' | 'turn' | 'major';
}

const styles = `
    :host { display: block; min-height: 0; }
    ol { list-style: none; margin: 8px 0 0; padding: 0; font-size: 12.5px; line-height: 1.4; }
    li { display: flex; gap: 8px; padding: 4px 0; border-top: 1px solid var(--border); }
    li .swatch { width: 8px; height: 8px; margin-top: 5px; box-shadow: none; }
    li.turn { color: var(--text-muted); }
    li.major { font-weight: 600; }
    li.battle { color: var(--text); }
`;

export class EventLog extends Component {
    constructor() {
        super(styles);
    }

    set entries(entries: LogRow[]) {
        this.renderHtml(`
            <h3>Chronicle</h3>
            <ol>${entries.map(entry => `
                <li class="${entry.kind}"><span class="swatch" style="background:${entry.color ?? 'var(--text-muted)'}"></span><span>${escapeHtml(entry.text)}</span></li>
            `).join('')}</ol>
        `);
    }
}

customElements.define('cq-event-log', EventLog);
