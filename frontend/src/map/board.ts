import boardJson from './board.json';

export interface Point {
    x: number;
    y: number;
}

export interface TerritoryShape {
    id: string;
    path: string;
    center: Point;
}

export const MAP_WIDTH = 1024;
export const MAP_HEIGHT = 660;

export const TERRITORY_SHAPES: ReadonlyMap<string, TerritoryShape> = new Map(
    boardJson.territories.map(territory => [territory.id, territory])
);

export const CONTINENT_COLORS: ReadonlyMap<string, { fill: string; stroke: string }> = new Map(
    boardJson.continents.map(continent => [continent.id, { fill: continent.fill, stroke: continent.stroke }])
);

export const SEA_ROUTES: readonly [string, string][] = [
    ['madagascar', 'south_africa'],
    ['east_africa', 'madagascar'],
    ['east_africa', 'middle_east'],
    ['egypt', 'southern_europe'],
    ['north_africa', 'southern_europe'],
    ['brazil', 'north_africa'],
    ['japan', 'kamchatka'],
    ['alaska', 'kamchatka'],
    ['indonesia', 'siam'],
    ['eastern_australia', 'new_guinea'],
    ['indonesia', 'new_guinea'],
    ['indonesia', 'western_australia'],
    ['new_guinea', 'western_australia'],
    ['great_britain', 'iceland'],
    ['great_britain', 'northern_europe'],
    ['great_britain', 'scandinavia'],
    ['great_britain', 'western_europe'],
    ['iceland', 'scandinavia'],
    ['greenland', 'iceland'],
    ['greenland', 'ontario'],
    ['greenland', 'quebec']
];

export function centerOf(territoryId: string): Point {
    const shape = TERRITORY_SHAPES.get(territoryId);

    if (!shape) {
        throw new Error(`No shape for territory "${territoryId}"`);
    }

    return shape.center;
}

export function wrapsAroundMap(from: Point, to: Point): boolean {
    return Math.abs(from.x - to.x) > MAP_WIDTH / 2;
}
