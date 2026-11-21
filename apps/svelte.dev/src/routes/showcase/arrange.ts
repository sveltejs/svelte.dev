import type { Site } from './sites.ts';

export interface Tile {
	site: Site;
	/** big is two columns across and two rows down */
	size: 'big' | 'small';
	/** for a big one, whether it is on the right of the rows it spans */
	right?: boolean;
	/**
	 * for a small one in the last row where three are across, how many share that row, which they
	 * widen to fill rather than leave a hole
	 */
	fill?: 1 | 2;
}

/**
 * lays out sites as a mosaic four columns across, three on smaller screens and two on phones, with
 * no holes. as many big as it takes for the cells to come out even, given to the first, which
 * leads the category, and then to the ones `shown` prefers, such as those that move. each big one
 * sits beside four small ones, or beside another big one when there are too few small ones to go
 * round, on alternate sides starting on the right if `right` says to, and any small ones left
 * over follow in rows
 */
export function arrange(
	sites: Site[],
	shown: (site: Site) => boolean = () => false,
	right_first = false
) {
	if (sites.length === 0) return [];

	// a big one takes four cells and the others one, so each more big one makes up three
	const count = sites.length % 4 || (sites.length >= 8 ? 4 : 0);

	// the first, then the preferred ones, then the rest, each in their order
	const [first, ...rest] = sites;
	const big = new Set(
		[first, ...rest.filter(shown), ...rest.filter((site) => !shown(site))].slice(0, count)
	);
	const bigs = sites.filter((site) => big.has(site));
	const bigs_count = bigs.length;
	const smalls = sites.filter((site) => !big.has(site));

	const tiles: Tile[] = [];
	let right = right_first;

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

	// where three are across, one big one has two small ones beside it, and the rest follow in
	// rows of three, so the last one or two widen to fill their row
	if (bigs_count === 1) {
		const left = tiles.length - 3;
		const over = left % 3;
		if (over > 0) {
			for (const tile of tiles.slice(-over)) tile.fill = over as 1 | 2;
		}
	}

	return tiles;
}
