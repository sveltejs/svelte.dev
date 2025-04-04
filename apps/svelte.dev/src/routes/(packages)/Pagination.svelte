<script lang="ts">
	import type { Snippet } from 'svelte';

	type Page = {
		type: 'page';
		value: number;
	};

	type Ellipsis = {
		type: 'ellipsis';
	};

	type PageItem = Page | Ellipsis;

	interface Props {
		/**
		 * The total number of pages.
		 */
		total: number;

		/**
		 * Number of visible items before and after the current page
		 *
		 * @default 1
		 */
		siblingCount?: number;

		/**
		 * The current page.
		 *
		 * @bindable
		 * @default 1
		 */
		page?: number;

		/**
		 * The children snippet, which will be rendered for every visible page
		 * selector.
		 */
		children: Snippet<[PageItem]>;
	}

	const { total, siblingCount = 1, page = $bindable(1), children }: Props = $props();

	function get_page_items(): Array<PageItem> {
		const page_items: Array<PageItem> = [];
		const pages_to_show = new Set([1, Math.max(total, 1)]);
		const first_item_with_siblings = 3 + siblingCount;
		const last_item_with_siblings = total - 2 - siblingCount;

		if (first_item_with_siblings > last_item_with_siblings) {
			for (let p = 2; p <= total - 1; p++) {
				pages_to_show.add(p);
			}
		} else if (page < first_item_with_siblings) {
			for (let p = 2; p <= Math.min(first_item_with_siblings, total); p++) {
				pages_to_show.add(p);
			}
		} else if (page > last_item_with_siblings) {
			for (let p = total - 1; p >= Math.max(last_item_with_siblings, 2); p--) {
				pages_to_show.add(p);
			}
		} else {
			for (
				let p = Math.max(page - siblingCount, 2);
				p <= Math.min(page + siblingCount, total);
				p++
			) {
				pages_to_show.add(p);
			}
		}

		const add_page = (value: number) => {
			page_items.push({ type: 'page', value });
		};
		const add_ellipsis = () => {
			page_items.push({ type: 'ellipsis' });
		};

		let last_number = 0;
		for (const page of Array.from(pages_to_show).sort((a, b) => a - b)) {
			if (page - last_number > 1) {
				add_ellipsis();
			}
			add_page(page);
			last_number = page;
		}

		return page_items;
	}

	const page_items = $derived(get_page_items());
</script>

{#each page_items as pageItem}
	{@render children(pageItem)}
{/each}
