import { Component, escapeHtml, svgElement } from '../core/component';
import {
    CONTINENT_COLORS,
    MAP_HEIGHT,
    MAP_WIDTH,
    SEA_ROUTES,
    TERRITORY_SHAPES,
    centerOf,
    wrapsAroundMap,
    type Point
} from '../map/board';

export type TerritoryMode = 'normal' | 'available' | 'selected' | 'target' | 'dim';

export interface TerritoryView {
    id: string;
    name: string;
    continentId: string;
    continentName: string;
    ownerName: string | null;
    color: string | null;
    units: number;
    mode: TerritoryMode;
}

export interface BoardArrow {
    from: string;
    to: string;
    kind: 'attack' | 'move';
    label?: string;
}

export interface BoardModel {
    territories: TerritoryView[];
    arrows: BoardArrow[];
}

export interface TerritoryClickDetail {
    id: string;
    shiftKey: boolean;
}

interface TerritoryNodes {
    land: SVGPathElement;
    marker: SVGGElement;
    disc: SVGCircleElement;
    label: SVGTextElement;
}

const styles = `
    :host { display: block; position: relative; min-height: 0; }
    svg { display: block; width: 100%; height: 100%; user-select: none; -webkit-user-select: none; }
    .sea { fill: url(#sea); }
    .graticule { fill: url(#graticule); pointer-events: none; }
    .routes line { stroke: var(--route); stroke-width: 1.5; stroke-dasharray: 4 5; pointer-events: none; }
    .halo path { stroke-width: 7; stroke-linejoin: round; pointer-events: none; }
    .land {
        stroke: rgba(10, 16, 28, .75);
        stroke-width: 1;
        stroke-linejoin: round;
        cursor: default;
        transition: fill .35s ease, opacity .2s ease, filter .2s ease;
    }
    .land.unowned { fill-opacity: 0; }
    .land.hover { filter: brightness(1.18); }
    .land.available { cursor: pointer; stroke: #fff; stroke-width: 1.6; animation: pulse 1.6s ease-in-out infinite; }
    .land.target { cursor: pointer; stroke: #fff; stroke-width: 2.4; stroke-dasharray: 5 3; filter: brightness(1.1); }
    .land.selected { cursor: pointer; stroke: #fff; stroke-width: 3; filter: brightness(1.25); }
    .land.dim { filter: saturate(.45) brightness(.62); }
    .marker { cursor: pointer; transition: opacity .2s ease; }
    .marker circle { stroke: rgba(8, 12, 22, .85); stroke-width: 2; transition: fill .35s ease, r .2s ease; }
    .marker text { fill: #fff; font: 700 11px/1 var(--font-ui); text-anchor: middle; dominant-baseline: central; pointer-events: none; }
    .marker.unowned circle { fill: rgba(15, 23, 42, .55); }
    .marker.unowned text { fill: rgba(255,255,255,.55); }
    .marker.dim { opacity: .7; }
    .marker.selected circle { stroke: #fff; stroke-width: 3; }
    .marker.bump circle { animation: bump .45s ease; }
    .arrows path { fill: none; stroke-width: 3.5; stroke-linecap: round; pointer-events: none; }
    .arrows .attack { stroke: #fff; filter: drop-shadow(0 0 3px rgba(255,80,60,.9)); }
    .arrows .move { stroke: #e2e8f0; stroke-dasharray: 7 5; animation: march 1s linear infinite; }
    .arrows text { fill: #fff; font: 700 11px var(--font-ui); paint-order: stroke; stroke: #0b1220; stroke-width: 3px; text-anchor: middle; }
    @keyframes pulse { 50% { stroke-opacity: .25; } }
    @keyframes march { to { stroke-dashoffset: -24; } }
    @keyframes bump { 40% { transform: scale(1.35); } }
    .tooltip {
        position: absolute;
        pointer-events: none;
        background: var(--surface-1);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
        line-height: 1.45;
        box-shadow: 0 8px 24px rgba(0,0,0,.35);
        opacity: 0;
        transform: translate(-50%, calc(-100% - 14px));
        transition: opacity .12s ease;
        white-space: nowrap;
        z-index: 2;
    }
    .tooltip.visible { opacity: 1; }
    .tooltip strong, .tooltip > span { display: block; }
    .tooltip strong { font-size: 13px; }
    .tooltip .owner { display: flex; align-items: center; gap: 6px; }
`;

export class BoardMap extends Component {
    private readonly nodes = new Map<string, TerritoryNodes>();
    private readonly views = new Map<string, TerritoryView>();
    private readonly svg: SVGSVGElement;
    private readonly arrowLayer: SVGGElement;
    private readonly tooltip: HTMLDivElement;
    private hoverId: string | null = null;

    constructor() {
        super(styles);

        this.svg = svgElement('svg', {
            viewBox: `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`,
            preserveAspectRatio: 'xMidYMid meet',
            role: 'img',
            'aria-label': 'World map'
        });
        this.svg.innerHTML = `
            <defs>
                <radialGradient id="sea" cx="50%" cy="45%" r="75%">
                    <stop offset="0" style="stop-color: var(--sea-light)"/>
                    <stop offset="1" style="stop-color: var(--sea-dark)"/>
                </radialGradient>
                <pattern id="graticule" width="64" height="64" patternUnits="userSpaceOnUse">
                    <path d="M64 0H0V64" fill="none" style="stroke: var(--graticule)" stroke-width="1"/>
                </pattern>
                <filter id="land-shadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".45"/>
                </filter>
                <marker id="head-attack" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M0 0L10 5L0 10z" fill="#fff"/>
                </marker>
                <marker id="head-move" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M0 0L10 5L0 10z" fill="#e2e8f0"/>
                </marker>
            </defs>
            <rect class="sea" width="${MAP_WIDTH}" height="${MAP_HEIGHT}"/>
            <rect class="graticule" width="${MAP_WIDTH}" height="${MAP_HEIGHT}"/>
        `;

        this.svg.append(this.buildRoutes());

        const halo = svgElement('g', { class: 'halo', filter: 'url(#land-shadow)' });
        const lands = svgElement('g', { class: 'lands' });
        const markers = svgElement('g', { class: 'markers' });

        this.arrowLayer = svgElement('g', { class: 'arrows' });

        for (const shape of TERRITORY_SHAPES.values()) {
            halo.append(svgElement('path', { d: shape.path, 'data-halo': shape.id }));

            const land = svgElement('path', { d: shape.path, class: 'land unowned', 'data-id': shape.id });
            const marker = svgElement('g', {
                class: 'marker unowned',
                'data-id': shape.id,
                transform: `translate(${shape.center.x} ${shape.center.y})`
            });
            const disc = svgElement('circle', { r: 10 });
            const label = svgElement('text');

            marker.append(disc, label);
            lands.append(land);
            markers.append(marker);
            this.nodes.set(shape.id, { land, marker, disc, label });
        }

        this.svg.append(halo, lands, this.arrowLayer, markers);

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.root.append(this.svg, this.tooltip);

        this.svg.addEventListener('click', event => this.handleClick(event));
        this.svg.addEventListener('pointermove', event => this.handlePointer(event));
        this.svg.addEventListener('pointerleave', () => this.setHover(null));
    }

    set model(model: BoardModel) {
        for (const view of model.territories) {
            this.renderTerritory(view);
        }

        this.renderArrows(model.arrows);
        this.renderTooltip();
    }

    private buildRoutes(): SVGGElement {
        const group = svgElement('g', { class: 'routes' });

        for (const [a, b] of SEA_ROUTES) {
            const from = centerOf(a);
            const to = centerOf(b);

            if (wrapsAroundMap(from, to)) {
                const [west, east] = from.x < to.x ? [from, to] : [to, from];

                group.append(
                    svgElement('line', { x1: west.x, y1: west.y, x2: 0, y2: west.y }),
                    svgElement('line', { x1: east.x, y1: east.y, x2: MAP_WIDTH, y2: east.y })
                );
            } else {
                group.append(svgElement('line', { x1: from.x, y1: from.y, x2: to.x, y2: to.y }));
            }
        }

        return group;
    }

    private renderTerritory(view: TerritoryView): void {
        const nodes = this.nodes.get(view.id);

        if (!nodes) {
            return;
        }

        const previous = this.views.get(view.id);
        const continent = CONTINENT_COLORS.get(view.continentId);
        const halo = this.svg.querySelector<SVGPathElement>(`[data-halo="${view.id}"]`);

        if (halo && continent && !previous) {
            halo.setAttribute('fill', continent.fill);
            halo.setAttribute('stroke', continent.stroke);
        }

        nodes.land.setAttribute('fill', view.color ?? continent?.fill ?? '#888');
        nodes.land.setAttribute('class', [
            'land',
            view.color ? 'owned' : 'unowned',
            view.mode,
            this.hoverId === view.id ? 'hover' : ''
        ].join(' '));

        nodes.marker.setAttribute('class', ['marker', view.color ? 'owned' : 'unowned', view.mode].join(' '));
        nodes.disc.setAttribute('fill', view.color ?? 'none');
        nodes.disc.setAttribute('r', String(view.units >= 10 ? 12 : 10));
        nodes.label.textContent = view.units > 0 ? String(view.units) : '';

        if (previous && previous.units !== view.units) {
            nodes.marker.classList.remove('bump');
            void nodes.marker.getBoundingClientRect();
            nodes.marker.classList.add('bump');
        }

        this.views.set(view.id, view);
    }

    private renderArrows(arrows: BoardArrow[]): void {
        this.arrowLayer.replaceChildren();

        for (const arrow of arrows) {
            const from = centerOf(arrow.from);
            const to = centerOf(arrow.to);
            const path = svgElement('path', {
                class: arrow.kind,
                d: this.arrowPath(from, to),
                'marker-end': `url(#head-${arrow.kind})`
            });

            this.arrowLayer.append(path);

            if (arrow.label && !wrapsAroundMap(from, to)) {
                const label = svgElement('text', { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 8 });

                label.textContent = arrow.label;
                this.arrowLayer.append(label);
            }
        }
    }

    private arrowPath(from: Point, to: Point): string {
        if (wrapsAroundMap(from, to)) {
            const edge = from.x < to.x ? 0 : MAP_WIDTH;

            return `M${from.x} ${from.y}L${edge} ${from.y}`;
        }

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const inset = Math.min(14, length / 3);
        const start = { x: from.x + (dx / length) * inset, y: from.y + (dy / length) * inset };
        const end = { x: to.x - (dx / length) * inset * 1.4, y: to.y - (dy / length) * inset * 1.4 };
        const bend = Math.min(30, length / 4);
        const control = {
            x: (start.x + end.x) / 2 - (dy / length) * bend,
            y: (start.y + end.y) / 2 + (dx / length) * bend
        };

        return `M${start.x} ${start.y}Q${control.x} ${control.y} ${end.x} ${end.y}`;
    }

    private territoryIdFrom(event: Event): string | null {
        const target = (event.target as Element).closest('[data-id]');

        return target ? target.getAttribute('data-id') : null;
    }

    private handleClick(event: MouseEvent): void {
        const id = this.territoryIdFrom(event);

        if (id) {
            this.emit<TerritoryClickDetail>('territory-click', { id, shiftKey: event.shiftKey });
        }
    }

    private handlePointer(event: PointerEvent): void {
        const id = this.territoryIdFrom(event);

        this.setHover(id);

        if (id) {
            const bounds = this.getBoundingClientRect();

            this.tooltip.style.left = `${event.clientX - bounds.left}px`;
            this.tooltip.style.top = `${event.clientY - bounds.top}px`;
        }
    }

    private setHover(id: string | null): void {
        if (id === this.hoverId) {
            return;
        }

        if (this.hoverId) {
            this.nodes.get(this.hoverId)?.land.classList.remove('hover');
        }

        this.hoverId = id;

        if (id) {
            this.nodes.get(id)?.land.classList.add('hover');
        }

        this.renderTooltip();
    }

    private renderTooltip(): void {
        const view = this.hoverId ? this.views.get(this.hoverId) : null;

        this.tooltip.classList.toggle('visible', !!view);

        if (!view) {
            return;
        }

        const owner = view.ownerName
            ? `<span class="owner"><span class="swatch" style="background:${view.color}"></span>${escapeHtml(view.ownerName)} · ${view.units} armies</span>`
            : '<span class="muted">Unclaimed</span>';

        this.tooltip.innerHTML = `<strong>${escapeHtml(view.name)}</strong><span class="muted">${escapeHtml(view.continentName)}</span>${owner}`;
    }
}

customElements.define('cq-board-map', BoardMap);
