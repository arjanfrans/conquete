import { Component, escapeHtml } from '../core/component';

export interface UnitRequest {
    title: string;
    description: string;
    confirmLabel: string;
    min: number;
    max: number;
    value: number;
}

const styles = `
    dialog {
        border: 1px solid var(--border);
        border-radius: 14px;
        background: var(--surface-1);
        color: var(--text);
        padding: 20px;
        width: min(360px, calc(100vw - 32px));
        box-shadow: 0 24px 60px rgba(0,0,0,.5);
    }
    dialog::backdrop { background: rgba(4, 8, 16, .55); backdrop-filter: blur(2px); }
    h2 { font-size: 18px; }
    p { margin: 6px 0 16px; color: var(--text-muted); font-size: 14px; }
    .value { font-size: 40px; font-weight: 700; text-align: center; font-variant-numeric: tabular-nums; }
    input[type=range] { width: 100%; accent-color: var(--accent); margin: 8px 0 4px; }
    .scale { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
`;

export class UnitDialog extends Component {
    private resolve: ((value: number | null) => void) | null = null;

    constructor() {
        super(styles);
    }

    request(request: UnitRequest): Promise<number | null> {
        this.resolve?.(null);

        this.root.innerHTML = `
            <dialog>
                <form method="dialog">
                    <h2>${escapeHtml(request.title)}</h2>
                    <p>${escapeHtml(request.description)}</p>
                    <div class="value"><output>${request.value}</output></div>
                    <input type="range" min="${request.min}" max="${request.max}" value="${request.value}" ${request.min === request.max ? 'disabled' : ''} aria-label="Armies">
                    <div class="scale"><span>${request.min}</span><span>${request.max}</span></div>
                    <div class="actions">
                        <button value="cancel" class="ghost">Cancel</button>
                        <button value="confirm" class="primary" autofocus>${escapeHtml(request.confirmLabel)}</button>
                    </div>
                </form>
            </dialog>`;

        const dialog = this.root.querySelector('dialog') as HTMLDialogElement;
        const range = this.root.querySelector('input') as HTMLInputElement;
        const output = this.root.querySelector('output') as HTMLOutputElement;

        range.addEventListener('input', () => {
            output.textContent = range.value;
        });

        return new Promise(resolve => {
            this.resolve = resolve;
            dialog.addEventListener('close', () => {
                this.resolve = null;
                resolve(dialog.returnValue === 'confirm' ? Number(range.value) : null);
            }, { once: true });
            dialog.showModal();
        });
    }
}

customElements.define('cq-unit-dialog', UnitDialog);
