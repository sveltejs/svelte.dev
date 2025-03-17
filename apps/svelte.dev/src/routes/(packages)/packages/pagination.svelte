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

	function getPageItems(): Array<PageItem> {
		const pageItems: Array<PageItem> = [];
		const pagesToShow = new Set([1, Math.max(total, 1)]);
		const firstItemWithSiblings = 3 + siblingCount;
		const lastItemWithSiblings = total - 2 - siblingCount;

		if (firstItemWithSiblings > lastItemWithSiblings) {
			for (let p = 2; p <= total - 1; p++) {
				pagesToShow.add(p);
			}
		} else if (page < firstItemWithSiblings) {
			for (let p = 2; p <= Math.min(firstItemWithSiblings, total); p++) {
				pagesToShow.add(p);
			}
		} else if (page > lastItemWithSiblings) {
			for (let p = total - 1; p >= Math.max(lastItemWithSiblings, 2); p--) {
				pagesToShow.add(p);
			}
		} else {
			for (
				let p = Math.max(page - siblingCount, 2);
				p <= Math.min(page + siblingCount, total);
				p++
			) {
				pagesToShow.add(p);
			}
		}

		const addPage = (value: number) => {
			pageItems.push({ type: 'page', value });
		};
		const addEllipsis = () => {
			pageItems.push({ type: 'ellipsis' });
		};

		let lastNumber = 0;
		for (const page of Array.from(pagesToShow).sort((a, b) => a - b)) {
			if (page - lastNumber > 1) {
				addEllipsis();
			}
			addPage(page);
			lastNumber = page;
		}

		return pageItems;
	}

	const pageItems = $derived(getPageItems());
</script>

{#each pageItems as pageItem}
	{@render children(pageItem)}
{/each}
