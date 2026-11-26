import { describe, expect, it } from 'vitest';
import { arrange } from './arrange.ts';
import type { Site } from './sites.ts';

function make(count: number): Site[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `site-${i}`,
		name: `Site ${i}`,
		url: 'https://example.com',
		description: '',
		category: 'brands'
	}));
}

/** the cells of a grid four across that the tiles fill, a big one taking four */
function cells(tiles: ReturnType<typeof arrange>) {
	return tiles.reduce((sum, tile) => sum + (tile.size === 'big' ? 4 : 1), 0);
}

describe('arrange', () => {
	it('returns nothing for no sites', () => {
		expect(arrange([])).toEqual([]);
	});

	it('keeps every site once', () => {
		for (let count = 1; count <= 24; count += 1) {
			const sites = make(count);
			const ids = arrange(sites).map((tile) => tile.site.id);
			expect(ids.toSorted()).toEqual(sites.map((site) => site.id).toSorted());
		}
	});

	it('fills rows of four with no holes', () => {
		for (let count = 1; count <= 24; count += 1) {
			expect(cells(arrange(make(count))) % 4).toBe(0);
		}
	});

	it('leads with the first site, made big', () => {
		const [first] = arrange(make(5));
		expect(first).toMatchObject({ site: { id: 'site-0' }, size: 'big' });
	});

	it('gives the other big ones to the preferred sites', () => {
		const tiles = arrange(make(6), (site) => site.id === 'site-4');
		const big = tiles.filter((tile) => tile.size === 'big').map((tile) => tile.site.id);
		expect(big).toEqual(['site-0', 'site-4']);
	});

	it('starts on the side asked for and alternates', () => {
		const big = (right_first: boolean) =>
			arrange(make(10), undefined, right_first)
				.filter((tile) => tile.size === 'big')
				.map((tile) => tile.right);

		expect(big(false)).toEqual([false, true]);
		expect(big(true)).toEqual([true, false]);
	});

	it('widens a short last row where three are across', () => {
		// one big and four small: two beside the big one, and two left for a row of three
		const tiles = arrange(make(5));
		expect(tiles.map((tile) => tile.fill)).toEqual([undefined, undefined, undefined, 2, 2]);
	});
});
