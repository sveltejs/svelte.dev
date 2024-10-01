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

/**
 * Search for a given query in the existing index
 */
export function search(query: string): BlockGroup[] {
	const escaped = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	const regex = new RegExp(`(^|\\b)${escaped}`, 'i');

	const blocks = indexes
		.flatMap((index) => index.search(query))
		// @ts-expect-error flexsearch types are wrong i think?
		.map(lookup)
		.map((block, rank) => ({ block: block as Block, rank }))
		.sort((a, b) => {
			const a_title_matches = regex.test(a.block.breadcrumbs.at(-1)!);
			const b_title_matches = regex.test(b.block.breadcrumbs.at(-1)!);

			// massage the order a bit, so that title matches
			// are given higher priority
			if (a_title_matches !== b_title_matches) {
				return a_title_matches ? -1 : 1;
			}

			return a.block.breadcrumbs.length - b.block.breadcrumbs.length || a.rank - b.rank;
		})
		.map(({ block }) => block);

	const groups: Record<string, BlockGroup> = {};

	for (const block of blocks) {
		const breadcrumbs = block.breadcrumbs.slice(0, 2);

		const group = (groups[breadcrumbs.join('::')] ??= {
			breadcrumbs,
			blocks: []
		});

		group.blocks.push(block);
	}

	return Object.values(groups);
}

/**
 * Get a block with details by its href
 */
export function lookup(href: string) {
	return map.get(href);
}
