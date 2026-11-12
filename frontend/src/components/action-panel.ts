import { Component, escapeHtml } from '../core/component';

export interface ActionButton {
    id: string;
    label: string;
    primary?: boolean;
    disabled?: boolean;
    title?: string;
}

export type DeployAmount = 1 | 5 | 'all';

export interface ActionPanelModel {
    playerName: string;
    playerColor: string;
    title: string;
    message: string;
    reinforcements: number | null;
    deployAmount: DeployAmount | null;
    buttons: ActionButton[];
    details: string[];
    thinking: boolean;
}

const DEPLOY_AMOUNTS: DeployAmount[] = [1, 5, 'all'];

const styles = `
    :host { display: block; }
    .head { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #fff; flex: none; box-shadow: inset 0 0 0 2px rgba(255,255,255,.25); }
    .avatar.thinking { animation: breathe 1.4s ease-in-out infinite; }
    @keyframes breathe { 50% { transform: scale(.88); opacity: .7; } }
    .title { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; }
    .name { font-weight: 600; font-size: 16px; }
    p { margin: 10px 0 0; font-size: 14px; line-height: 1.45; }
    .reinforcements { display: flex; align-items: baseline; gap: 6px; margin-top: 10px; }
    .reinforcements strong { font-size: 28px; font-variant-numeric: tabular-nums; }
    .amounts { display: inline-flex; margin-left: auto; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .amounts button { border: 0; border-radius: 0; padding: 5px 10px; background: transparent; }
    .amounts button[aria-pressed="true"] { background: var(--accent); color: var(--accent-text); }
    .buttons { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .buttons button { flex: 1 1 auto; }
    ul { margin: 10px 0 0; padding: 0; list-style: none; font-size: 13px; color: var(--text-muted); }
    li { padding: 3px 0; }
    li::before { content: '➜ '; color: var(--text); }
`;

export class ActionPanel extends Component {
    constructor() {
        super(styles);
        this.root.addEventListener('click', event => {
            const button = (event.target as Element).closest('button');

            if (button?.dataset.amount) {
                const raw = button.dataset.amount;

                this.emit<DeployAmount>('deploy-amount', raw === 'all' ? 'all' : Number(raw) as DeployAmount);
            } else if (button?.dataset.action) {
                this.emit<string>('action', button.dataset.action);
            }
        });
    }

    set model(model: ActionPanelModel) {
        const initial = escapeHtml(model.playerName.slice(0, 1).toUpperCase());
        const reinforcements = model.reinforcements === null ? '' : `
            <div class="reinforcements">
                <strong>${model.reinforcements}</strong><span class="muted">armies to deploy</span>
                ${model.deployAmount === null ? '' : `<div class="amounts" role="group" aria-label="Armies per click">
                    ${DEPLOY_AMOUNTS.map(amount => `<button data-amount="${amount}" aria-pressed="${amount === model.deployAmount}">${amount === 'all' ? 'All' : `+${amount}`}</button>`).join('')}
                </div>`}
            </div>`;

        this.renderHtml(`
            <div class="head">
                <div class="avatar ${model.thinking ? 'thinking' : ''}" style="background:${model.playerColor}">${initial}</div>
                <div>
                    <div class="title">${escapeHtml(model.title)}</div>
                    <div class="name">${escapeHtml(model.playerName)}</div>
                </div>
            </div>
            <p>${escapeHtml(model.message)}</p>
            ${reinforcements}
            ${model.details.length ? `<ul>${model.details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>` : ''}
            ${model.buttons.length ? `<div class="buttons">${model.buttons.map(button => `
                <button data-action="${button.id}" class="${button.primary ? 'primary' : ''}" ${button.disabled ? 'disabled' : ''} title="${escapeHtml(button.title ?? '')}">${escapeHtml(button.label)}</button>
            `).join('')}</div>` : ''}
        `);
    }
}

customElements.define('cq-action-panel', ActionPanel);
