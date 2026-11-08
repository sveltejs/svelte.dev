import type { Site } from './sites.ts';

export interface Tile {
	site: Site;
	/** big is two columns across and two rows down */
	size: 'big' | 'small';
	/** for a big one, whether it is on the right of the rows it spans */
	right?: boolean;
}

/**
 * lays out sites as a mosaic four columns across, or two on small screens, with no holes. as many
 * big as it takes for the cells to come out even, given to the ones `shown` prefers, such as those
 * that move. each big one sits beside four small ones, or beside another big one when there are
 * too few small ones to go round, on alternate sides, and any small ones left over follow in rows
 */
export function arrange(sites: Site[], shown: (site: Site) => boolean = () => false) {
	if (sites.length === 0) return [];

	// a big one takes four cells and the others one, so each more big one makes up three
	const count = sites.length % 4 || (sites.length >= 8 ? 4 : 0);

	// the preferred ones first, then the rest, each in their order
	const big = new Set(
		[...sites.filter(shown), ...sites.filter((site) => !shown(site))].slice(0, count)
	);
	const bigs = sites.filter((site) => big.has(site));
	const smalls = sites.filter((site) => !big.has(site));

	const tiles: Tile[] = [];
	let right = false;

	while (bigs.length > 0) {
		// two side by side when there are not enough small ones for each to have four beside it
		if (bigs.length >= 2 && smalls.length < 4 * bigs.length) {
			tiles.push({ site: bigs.shift()!, size: 'big', right: false });
			tiles.push({ site: bigs.shift()!, size: 'big', right: true });
			continue;
		}

		tiles.push({ site: bigs.shift()!, size: 'big', right });
		for (const site of smalls.splice(0, 4)) tiles.push({ site, size: 'small' });
		right = !right;
	}

	for (const site of smalls) tiles.push({ site, size: 'small' });

	return tiles;
}
