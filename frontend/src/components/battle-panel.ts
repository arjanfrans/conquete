import { Component, escapeHtml } from '../core/component';
import { dieSvg, type DieResult } from '../core/glyphs';
import type { DiceRoll } from '../game/types';

export interface BattleSideView {
    name: string;
    color: string;
    territory: string;
    units: number;
    initialUnits: number;
}

export interface BattlePanelModel {
    attacker: BattleSideView;
    defender: BattleSideView;
    roll: DiceRoll | null;
    outcome: { title: string; detail: string; victory: boolean } | null;
    rollPrompt: { side: 'attacker' | 'defender'; maxDice: number; playerName: string } | null;
    waitingFor: string | null;
}

export interface RollDetail {
    dice: number;
    auto: boolean;
}

const styles = `
    :host {
        display: block;
        background: color-mix(in srgb, var(--surface-1) 94%, transparent);
        backdrop-filter: blur(8px);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 16px 40px rgba(0,0,0,.45);
        animation: rise .25s ease;
    }
    :host([hidden]) { display: none; }
    @keyframes rise { from { transform: translateY(12px); opacity: 0; } }
    .sides { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; }
    .side { min-width: 0; }
    .side.defender { text-align: right; }
    .who { display: flex; align-items: center; gap: 6px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .defender .who { justify-content: flex-end; }
    .where { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar { height: 6px; border-radius: 3px; background: var(--surface-3); margin-top: 6px; overflow: hidden; }
    .bar span { display: block; height: 100%; border-radius: 3px; transition: width .35s ease; }
    .defender .bar span { margin-left: auto; }
    .count { font-variant-numeric: tabular-nums; font-size: 22px; font-weight: 700; margin-top: 2px; }
    .versus { font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--text-muted); }
    .dice { display: flex; gap: 6px; min-height: 34px; margin-top: 8px; }
    .defender .dice { justify-content: flex-end; }
    .die { width: 34px; height: 34px; animation: tumble .35s ease; }
    .die rect { stroke-width: 2; }
    .die.attacker rect { fill: #f8e7e3; stroke: #c2412d; }
    .die.attacker .pips { fill: #9a2a1a; }
    .die.defender rect { fill: #e2ebfb; stroke: #2f5fb3; }
    .die.defender .pips { fill: #1c3f80; }
    .die.loss { opacity: .45; }
    .die.win rect { stroke-width: 3.5; }
    @keyframes tumble { from { transform: rotate(-90deg) scale(.4); opacity: 0; } }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; margin-top: 12px; }
    .controls .label { font-size: 13px; color: var(--text-muted); margin-right: 4px; }
    .waiting { text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-muted); }
    .outcome { text-align: center; margin-top: 12px; }
    .outcome strong { display: block; font-size: 17px; }
    .outcome.victory strong { color: var(--positive); }
    .outcome.defeat strong { color: var(--negative); }
    .outcome .muted { font-size: 13px; }
    .outcome button { margin-top: 8px; }
`;

function diceResults(roll: DiceRoll): { attacker: DieResult[]; defender: DieResult[] } {
    const attacker: DieResult[] = roll.attacker.map(() => 'none');
    const defender: DieResult[] = roll.defender.map(() => 'none');

    if (roll.defender.length) {
        roll.defender.forEach((value, index) => {
            const opposing = roll.attacker[index];

            if (opposing === undefined) {
                return;
            }

            const attackerWins = opposing > value;

            attacker[index] = attackerWins ? 'win' : 'loss';
            defender[index] = attackerWins ? 'loss' : 'win';
        });
    }

    return { attacker, defender };
}

export class BattlePanel extends Component {
    constructor() {
        super(styles);
        this.root.addEventListener('click', event => {
            const button = (event.target as Element).closest('button');

            if (!button) {
                return;
            }

            if (button.dataset.dice) {
                this.emit<RollDetail>('roll', { dice: Number(button.dataset.dice), auto: button.dataset.auto === 'true' });
            } else if (button.dataset.dismiss !== undefined) {
                this.emit('dismiss');
            }
        });
    }

    set model(model: BattlePanelModel) {
        const results = model.roll ? diceResults(model.roll) : { attacker: [], defender: [] };
        const side = (view: BattleSideView, kind: 'attacker' | 'defender', dice: number[], outcome: DieResult[]) => `
            <div class="side ${kind}">
                <div class="who"><span class="swatch" style="background:${view.color}"></span>${escapeHtml(view.name)}</div>
                <div class="where">${kind === 'attacker' ? 'from' : 'holding'} ${escapeHtml(view.territory)}</div>
                <div class="count">${view.units}</div>
                <div class="bar"><span style="width:${view.initialUnits ? (view.units / view.initialUnits) * 100 : 0}%;background:${view.color}"></span></div>
                <div class="dice">${dice.map((value, index) => dieSvg(value, kind, outcome[index] ?? 'none')).join('')}</div>
            </div>`;

        this.renderHtml(`
            <div class="sides">
                ${side(model.attacker, 'attacker', model.roll?.attacker ?? [], results.attacker)}
                <div class="versus">VS</div>
                ${side(model.defender, 'defender', model.roll?.defender ?? [], results.defender)}
            </div>
            ${this.footer(model)}
        `);
    }

    private footer(model: BattlePanelModel): string {
        if (model.outcome) {
            return `<div class="outcome ${model.outcome.victory ? 'victory' : 'defeat'}">
                <strong>${escapeHtml(model.outcome.title)}</strong>
                <span class="muted">${escapeHtml(model.outcome.detail)}</span><br>
                <button data-dismiss>Continue</button>
            </div>`;
        }

        if (model.rollPrompt) {
            const prompt = model.rollPrompt;
            const buttons = Array.from({ length: prompt.maxDice }, (_, index) => index + 1)
                .reverse()
                .map(count => `<button class="${count === prompt.maxDice ? 'primary' : ''}" data-dice="${count}">Roll ${count}</button>`)
                .join('');

            return `<div class="controls">
                <span class="label">${escapeHtml(prompt.playerName)}, ${prompt.side === 'attacker' ? 'attack' : 'defend'}:</span>
                ${buttons}
                <button class="ghost" data-dice="${prompt.maxDice}" data-auto="true" title="Keep rolling the maximum until the battle ends">Auto-resolve</button>
            </div>`;
        }

        return `<div class="waiting">${model.waitingFor ? `Waiting for ${escapeHtml(model.waitingFor)} to roll…` : ''}</div>`;
    }
}

customElements.define('cq-battle-panel', BattlePanel);
