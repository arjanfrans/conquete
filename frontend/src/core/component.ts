const sheetCache = new Map<string, CSSStyleSheet>();

function sheet(css: string): CSSStyleSheet {
    let cached = sheetCache.get(css);

    if (!cached) {
        cached = new CSSStyleSheet();
        cached.replaceSync(css);
        sheetCache.set(css, cached);
    }

    return cached;
}

export const sharedStyles = `
    :host { box-sizing: border-box; }
    *, *::before, *::after { box-sizing: inherit; }
    button {
        font: inherit;
        color: var(--text);
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 7px 12px;
        cursor: pointer;
        transition: background .15s, border-color .15s, transform .05s;
    }
    button:hover:not(:disabled) { background: var(--surface-3); border-color: var(--border-strong); }
    button:active:not(:disabled) { transform: translateY(1px); }
    button:disabled { opacity: .45; cursor: not-allowed; }
    button.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-text); font-weight: 600; }
    button.primary:hover:not(:disabled) { background: var(--accent-strong); border-color: var(--accent-strong); }
    button.ghost { background: transparent; }
    button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    h2, h3 { margin: 0; font-weight: 600; }
    h3 { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); }
    .swatch { display: inline-block; width: 12px; height: 12px; border-radius: 50%; flex: none; box-shadow: 0 0 0 2px rgba(0,0,0,.25); }
    .muted { color: var(--text-muted); }
`;

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export abstract class Component extends HTMLElement {
    protected readonly root: ShadowRoot;
    private renderedHtml: string | null = null;

    protected constructor(styles: string) {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets = [sheet(sharedStyles), sheet(styles)];
    }

    protected renderHtml(html: string): void {
        if (html !== this.renderedHtml) {
            this.renderedHtml = html;
            this.root.innerHTML = html;
        }
    }

    protected emit<T>(name: string, detail?: T): void {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
}

export function svgElement<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attributes: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);

    for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, String(value));
    }

    return element;
}
