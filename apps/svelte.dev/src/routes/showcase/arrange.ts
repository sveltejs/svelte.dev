import type { Site } from './sites.ts';

export interface Cell {
	site: Site;
	/** in six columns on wide screens */
	kind: 'beside' | 'large' | 'half' | 'third';
	/** in two columns on medium screens */
	medium: 'beside' | 'full' | 'half';
}

/**
 * lays out a category in its order with no gaps, the first large with the next two stacked beside
 * it, and the rest in thirds, or halves where a third would be left on its own, with one left in a
 * row of its own having its text beside the screenshot
 */
export function arrange(sites: Site[]) {
	const cells: Cell[] = [];

	const add = (site: Site, kind: Cell['kind']) => {
		const medium = kind === 'large' ? 'full' : kind === 'beside' ? kind : 'half';
		cells.push({ site, kind, medium });
	};

	let rest = sites;

	if (sites.length >= 3) {
		add(sites[0], 'large');
		add(sites[1], 'third');
		add(sites[2], 'third');
		rest = sites.slice(3);
	}

	for (const [i, site] of rest.entries()) {
		add(
			site,
			rest.length === 1 ? 'beside' : i < rest.length - halves(rest.length) ? 'third' : 'half'
		);
	}

	// two to a row on medium screens, so one left on its own has its text beside it
	let count = 0;

	for (const [i, cell] of cells.entries()) {
		if (cell.medium === 'half') {
			count += 1;
		} else {
			if (count % 2) cells[i - 1].medium = 'beside';
			count = 0;
		}
	}

	if (count % 2) cells[cells.length - 1].medium = 'beside';

	return cells;
}

/** how many in a run of this many go in halves, so no third is left in a row of its own */
function halves(n: number) {
	return [0, 4, 2][n % 3];
}
