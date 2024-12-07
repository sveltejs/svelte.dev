import '@sveltejs/site-kit/polyfills';
import flexsearch, { type Index as FlexSearchIndex } from 'flexsearch';
import type { Block, BlockGroup } from './types';

// @ts-expect-error
const Index = (flexsearch.Index as FlexSearchIndex) ?? flexsearch;

/** If the search is already initialized */
export let inited = false;

let indexes: FlexSearchIndex[];

const map = new Map<string, Block>();

const hrefs = new Map<string, string>();

/**
 * Initialize the search index
 */
export function init(blocks: Block[]) {
	if (inited) return;

	// we have multiple indexes, so we can rank sections (migration guide comes last)
	const max_rank = Math.max(...blocks.map((block) => block.rank ?? 0));

	// @ts-expect-error
	indexes = Array.from({ length: max_rank + 1 }, () => new Index({ tokenize: 'forward' }));

	for (const block of blocks) {
		const title = block.breadcrumbs.at(-1);
		map.set(block.href, block);
		// NOTE: we're not using a number as the ID here, but it is recommended:
		// https://github.com/nextapps-de/flexsearch#use-numeric-ids
		// If we were to switch to a number we would need a second map from ID to block
		// We need to keep the existing one to allow looking up recent searches by URL even if docs change
		// It's unclear how much browsers do string interning and how this might affect memory
		// We'd probably want to test both implementations across browsers if memory usage becomes an issue
		// TODO: fix the type by updating flexsearch after
		// https://github.com/nextapps-de/flexsearch/pull/364 is merged and released
		indexes[block.rank ?? 0].add(block.href, `${title} ${block.content}`);

		hrefs.set(block.breadcrumbs.join('::'), block.href);
	}

	inited = true;
}

const CURRENT_SECTION_BOOST = 2;
const EXACT_MATCH_BOOST = 10;
const WORD_MATCH_BOOST = 4;
const NEAR_MATCH_BOOST = 2;
const BREADCRUMB_LENGTH_BOOST = 0.2;

interface Entry {
	block: Block;
	score: number;
	rank: number;
}

/**
 * Search for a given query in the existing index
 */
export function search(query: string, path: string): BlockGroup[] {
	const escaped = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	const exact_match = new RegExp(`^${escaped}$`, 'i');
	const word_match = new RegExp(`(^|\\b)${escaped}($|\\b)`, 'i');
	const near_match = new RegExp(`(^|\\b)${escaped}`, 'i');

	const parts = path.split('/');

	const blocks = indexes
		.flatMap((index) => index.search(query))
		// @ts-expect-error flexsearch types are wrong i think?
		.map(lookup)
		.map((block, rank) => {
			const block_parts = block.href.split('/');

			// prioritise current section
			let score = block_parts.findIndex((part, i) => part !== parts[i]);
			if (score === -1) score = block_parts.length;
			score *= CURRENT_SECTION_BOOST;

			if (block.breadcrumbs.some((text) => exact_match.test(text))) {
				console.log('EXACT MATCH', block.breadcrumbs);
				score += EXACT_MATCH_BOOST;
			} else if (block.breadcrumbs.some((text) => word_match.test(text))) {
				score += WORD_MATCH_BOOST;
			} else if (block.breadcrumbs.some((text) => near_match.test(text))) {
				score += NEAR_MATCH_BOOST;
			}

			// prioritise branches over leaves
			score -= block.breadcrumbs.length * BREADCRUMB_LENGTH_BOOST;

			const entry: Entry = { block, score, rank };

			return entry;
		});

	const grouped: Record<string, { breadcrumbs: string[]; entries: Entry[] }> = {};

	for (const entry of blocks) {
		const breadcrumbs = entry.block.breadcrumbs.slice(0, 2);
		const group = (grouped[breadcrumbs.join('::')] ??= {
			breadcrumbs,
			entries: []
		});

		group.entries.push(entry);
	}

	const sorted = Object.values(grouped);

	// sort blocks within groups...
	for (const group of sorted) {
		group.entries.sort((a, b) => b.score - a.score || a.rank - b.rank);
	}

	// ...then sort groups
	sorted.sort((a, b) => b.entries[0].score - a.entries[0].score);

	return sorted.map((group) => {
		return {
			breadcrumbs: group.breadcrumbs,
			blocks: group.entries.map((entry) => entry.block)
		};
	});
}

/**
 * Get a block with details by its href
 */
export function lookup(href: string) {
	return map.get(href)!;
}
