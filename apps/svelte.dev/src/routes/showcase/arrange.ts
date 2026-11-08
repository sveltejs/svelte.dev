import type { Site } from './sites.ts';

export interface Tile {
	site: Site;
	/** big is two columns across and two rows down, at 16:10 like the rest */
	size: 'big' | 'small';
	/** for a big one, whether it is on the right of the rows it spans */
	right?: boolean;
}

/**
 * lays out sites in their order as a mosaic four columns across, or two on small screens, the
 * first big and as many more big as it takes for the last row to come out full, spread through
 * the rest and on alternate sides
 */
export function arrange(sites: Site[]) {
	const tiles: Tile[] = sites.map((site) => ({ site, size: 'small' }));
	if (tiles.length === 0) return tiles;

	// a big one takes four cells and the others one, so each more big one makes up three
	const big = ((tiles.length - 1) % 4) + 1;

	for (let i = 0; i < big; i += 1) {
		const tile = tiles[Math.floor((i * tiles.length) / big)];
		tile.size = 'big';
		tile.right = i % 2 === 1;
	}

	return tiles;
}

/**
 * puts sites in rows that each fit one more than the last, starting at three, so they get smaller
 * and more crowded as they go
 */
export function congest(sites: Site[]) {
	const crowd: Array<{ site: Site; across: number }> = [];

	for (let across = 3, start = 0; start < sites.length; start += across, across += 1) {
		for (const site of sites.slice(start, start + across)) crowd.push({ site, across });
	}

	return crowd;
}
