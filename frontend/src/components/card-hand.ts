import { Component, escapeHtml } from '../core/component';
import { cardGlyph } from '../core/glyphs';

export interface CardView {
    id: string;
    type: string;
    label: string;
}

export interface CardHandModel {
    ownerName: string;
    cards: CardView[];
    canRedeem: boolean;
    mustRedeem: boolean;
    combos: { cards: string[]; bonus: number }[];
    isValidCombo: (cards: string[]) => boolean;
}

const styles = `
    :host { display: block; }
    .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .cards { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .card {
        width: 64px; padding: 8px 4px 6px; border-radius: 8px;
        background: linear-gradient(160deg, var(--card-top), var(--card-bottom));
        border: 1px solid var(--border-strong);
        color: var(--card-ink);
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        font-size: 10px; line-height: 1.15; text-align: center;
        transition: transform .15s ease, box-shadow .15s ease;
    }
    button.card:hover:not(:disabled) { background: linear-gradient(160deg, var(--card-top), var(--card-bottom)); transform: translateY(-3px); }
    .card[aria-pressed="true"] { transform: translateY(-5px); box-shadow: 0 0 0 2px var(--accent), 0 8px 16px rgba(0,0,0,.35); }
    .glyph { width: 26px; height: 26px; fill: currentColor; }
    .type { text-transform: uppercase; letter-spacing: .06em; font-size: 8px; opacity: .7; }
    .empty { margin-top: 8px; font-size: 13px; color: var(--text-muted); }
    .warning { color: var(--warning); font-size: 13px; margin-top: 8px; }
    details { margin-top: 10px; font-size: 12px; color: var(--text-muted); }
    summary { cursor: pointer; }
    table { margin-top: 6px; border-collapse: collapse; }
    td { padding: 2px 10px 2px 0; }
`;

export class CardHand extends Component {
    private selection = new Set<string>();
    private current: CardHandModel | null = null;

    constructor() {
        super(styles);
        this.root.addEventListener('click', event => {
            const button = (event.target as Element).closest('button');

            if (!button || !this.current) {
                return;
            }

            if (button.dataset.card) {
                this.toggle(button.dataset.card);
            } else if (button.dataset.redeem !== undefined) {
                this.emit<string[]>('redeem', [...this.selection]);
                this.selection.clear();
            }
        });
    }

    set model(model: CardHandModel) {
        const ids = new Set(model.cards.map(card => card.id));

        this.selection = new Set([...this.selection].filter(id => ids.has(id)));
        this.current = model;
        this.render();
    }

    private toggle(id: string): void {
        if (this.selection.has(id)) {
            this.selection.delete(id);
        } else if (this.selection.size < 3) {
            this.selection.add(id);
        }

        this.render();
    }

    private render(): void {
        const model = this.current;

        if (!model) {
            return;
        }

        const selected = [...this.selection];
        const valid = selected.length === 3 && model.isValidCombo(selected);
        const cards = model.cards.map(card => `
            <button class="card" data-card="${card.id}" aria-pressed="${this.selection.has(card.id)}" ${model.canRedeem ? '' : 'disabled'} title="${escapeHtml(card.label)}">
                ${cardGlyph(card.type)}
                <span class="type">${escapeHtml(card.type)}</span>
                <span>${escapeHtml(card.label)}</span>
            </button>`).join('');

        this.renderHtml(`
            <div class="row">
                <h3>Cards · ${escapeHtml(model.ownerName)}</h3>
                ${model.canRedeem ? `<button class="${valid ? 'primary' : ''}" data-redeem ${valid ? '' : 'disabled'}>Trade in</button>` : ''}
            </div>
            ${model.cards.length ? `<div class="cards">${cards}</div>` : '<div class="empty">No cards yet. Conquer a territory during your turn to earn one.</div>'}
            ${model.mustRedeem ? '<div class="warning">Five or more cards: trade in a set before attacking.</div>' : ''}
            ${model.canRedeem && selected.length === 3 && !valid ? '<div class="warning">That is not a valid set.</div>' : ''}
            <details>
                <summary>Card sets</summary>
                <table>${model.combos.map(combo => `<tr><td>${combo.cards.map(escapeHtml).join(' + ')}</td><td><strong>${combo.bonus}</strong></td></tr>`).join('')}</table>
                Jokers count as any type.
            </details>
        `);
    }
}

customElements.define('cq-card-hand', CardHand);
