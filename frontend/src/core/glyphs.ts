const PIP_LAYOUT: Record<number, [number, number][]> = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [3, 1], [1, 3], [3, 3]],
    5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]],
    6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]]
};

export type DieResult = 'win' | 'loss' | 'none';

export function dieSvg(value: number, side: 'attacker' | 'defender', result: DieResult): string {
    const pips = (PIP_LAYOUT[value] ?? [])
        .map(([x, y]) => `<circle cx="${x * 10}" cy="${y * 10}" r="3.6"/>`)
        .join('');

    return `<svg class="die ${side} ${result}" viewBox="0 0 40 40" role="img" aria-label="${value}">
        <rect x="1.5" y="1.5" width="37" height="37" rx="8"/>
        <g class="pips">${pips}</g>
    </svg>`;
}

export function cardGlyph(type: string): string {
    switch (type) {
        case 'infantry':
            return `<svg viewBox="0 0 24 24" class="glyph"><circle cx="12" cy="6" r="3.2"/><path d="M7 21v-6.5C7 11.5 9 10 12 10s5 1.5 5 4.5V21h-3v-5h-4v5z"/></svg>`;
        case 'cavalry':
            return `<svg viewBox="0 0 24 24" class="glyph"><path d="M5 21l1.5-6-2.5-2 3-5 4-2.5L13 3l1 3 4 2 2 4-2 1-2.5-1.5L14 14l1.5 7h-3l-1-5-3 .5-1 5.5z"/></svg>`;
        case 'artillery':
            return `<svg viewBox="0 0 24 24" class="glyph"><path d="M3 12.5l13-5 1.2 3-13 5z"/><circle cx="9" cy="17" r="3.5"/><path d="M14 14h6v2h-6z"/></svg>`;
        default:
            return `<svg viewBox="0 0 24 24" class="glyph"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"/></svg>`;
    }
}
