<script lang="ts">
	import { page } from '$app/state';
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { QueryParamSerde, reactive_query_params } from '@sveltejs/site-kit/reactivity';
	import { onMount } from 'svelte';
	import PackageCard from './PackageCard.svelte';
	import { type SortCriterion } from './packages-search';
	import Pagination from './Pagination.svelte';
	import { on } from 'svelte/events';

	const { data } = $props();

	const qps = reactive_query_params({
		query: QueryParamSerde.string(),
		page: QueryParamSerde.number(1),
		svelte_5_only: QueryParamSerde.boolean(false),
		hide_outdated: QueryParamSerde.boolean(false),
		sort_by: QueryParamSerde.string<SortCriterion>('popularity')
	});

	let registry = $derived(data.registry);
	let total_pages = $derived(data.pages?.total_pages);

	let ready = $state(false);
	let uid = 1;

	let worker_first_run = true;

	const scroll_states = $state(
		Array.from({ length: data.homepage?.length || 0 }, () => ({ start: false, end: true }))
	);

	let homepage_card_width = $state<number | null>(null);

	let worker: Worker;
	onMount(() => {
		worker = new Worker(new URL('./packages-worker.ts', import.meta.url), { type: 'module' });

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'update-page') {
				qps.page = payload.page;
			}

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				registry = payload.results;
				total_pages = payload.total_pages;
			}
		});

		worker.postMessage({
			type: 'init',
			payload: {
				origin: location.origin
			}
		});

		return () => worker.terminate();
	});

	$effect(() => {
		qps.query;
		qps.page;
		qps.svelte_5_only;
		qps.hide_outdated;
		qps.sort_by;

		if (!ready) return;

		if (worker_first_run) {
			worker_first_run = false;
			return;
		}

		const id = uid++;

		worker.postMessage({
			type: 'get',
			id,
			payload: {
				query: qps.query,
				page: qps.page,
				svelte_5_only: qps.svelte_5_only,
				hide_outdated: qps.hide_outdated,
				sort_by: qps.sort_by
			}
		});
	});

	$inspect(qps.query);

	// This function is first run on onMount to enable/disable the arrow buttons, and on scroll
	function handle_scroll(node: HTMLElement, idx: number) {
		function update() {
			const width = node.offsetWidth;
			const scroll_width = node.scrollWidth;
			const scroll_left = node.scrollLeft;

			scroll_states[idx].start = scroll_left !== 0;
			scroll_states[idx].end = scroll_left + width !== scroll_width;
		}

		update();

		const controller = new AbortController();

		on(node, 'scroll', update, { passive: true, signal: controller.signal });
		on(window, 'resize', update, { passive: true, signal: controller.signal });

		return {
			destroy: () => {
				controller.abort();
			}
		};
	}

	function on_next(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (homepage_card_width) {
			e.currentTarget.previousElementSibling?.scrollBy({
				behavior: 'smooth',
				left: homepage_card_width
			});
		}
	}

	function on_previous(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (homepage_card_width) {
			e.currentTarget.nextElementSibling?.children[0]?.scrollBy({
				behavior: 'smooth',
				left: -homepage_card_width
			});
		}
	}
</script>

<svelte:head>
	<title>Packages • Svelte</title>

	<meta name="twitter:title" content="Packages • Svelte" />
	<meta name="twitter:description" content="Articles about Svelte and UI development" />
	<meta name="Description" content="Articles about Svelte and UI development" />
</svelte:head>

<h1 class="visually-hidden">Packages</h1>

<div class="container">
	<div class="page content">
		<div class="controls">
			<form onsubmit={(e) => e.preventDefault()}>
				<label class="input-group">
					<Icon name="search" />
					<input
						name="query"
						use:forcefocus
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.stopPropagation();
								e.preventDefault();
							}
						}}
						enterkeyhint="search"
						bind:value={qps.query}
						placeholder="Search {data.packages_count} packages"
						aria-describedby="search-description"
						aria-label="Search"
						spellcheck="false"
					/>

					<button
						aria-label="Clear"
						onclick={(e) => {
							e.stopPropagation();
							qps.query = '';
						}}
					>
						<Icon name="close" />
					</button>
				</label>
			</form>
		</div>

		{#if !qps.query && data.homepage}
			<br /><br />

			<section class="homepage">
				<!-- Here we show netflix style page -->
				{#each data.homepage as { packages, title }, idx}
					<section>
						<h2>{title}</h2>
						<div class="homepage-wrapper-wrapper">
							{#if scroll_states[idx].start}
								<button class="start" onclick={on_previous}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="3em"
										height="3em"
										viewBox="0 0 24 24"
										><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><path
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="m15 18l-6-6l6-6"
										/></svg
									>
								</button>
							{/if}

							<div class={['homepage-posts-wrapper', scroll_states[idx].start && 'start']}>
								<div
									class={['homepage-posts', scroll_states[idx].end && 'end']}
									use:handle_scroll={idx}
								>
									{#each packages as pkg}
										<PackageCard {pkg} bind:width={homepage_card_width} />
									{/each}
								</div>

								{#if scroll_states[idx].end}
									<button class="end" onclick={on_next}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="3em"
											height="3em"
											viewBox="0 0 24 24"
											><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><path
												fill="none"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="m9 18l6-6l-6-6"
											/></svg
										>
									</button>
								{/if}
							</div>
						</div>
					</section>
					<br /><br /><br /><br />
				{/each}
			</section>
		{:else if registry && total_pages}
			<div class="posts">
				{#each registry as pkg}
					<PackageCard {pkg} />
				{/each}
			</div>

			<div class="pagination">
				<Pagination total={total_pages} bind:page={qps.page}>
					{#snippet children(page_item)}
						{#if page_item.type === 'ellipsis'}
							<span>-</span>
						{:else}
							{@const url = new URL(page.url)}
							{@const _ = url.searchParams.set('page', page_item.value.toString())}
							<a
								href={url.pathname + url.search}
								aria-current={qps.page === page_item.value}
								onclick={(e) => {
									e.preventDefault();
									qps.page = page_item.value;
								}}
							>
								{page_item.value}
							</a>
						{/if}
					{/snippet}
				</Pagination>
			</div>
		{/if}
	</div>
</div>

<style>
	.homepage {
		h2 {
			margin-bottom: 2rem;
		}

		.homepage-wrapper-wrapper {
			position: relative;

			width: 100%;

			button.start {
				position: absolute;
				color: var(--sk-fg-3);
				cursor: pointer;

				left: 0;
				top: 50%;
				z-index: 100;
				transform: translateY(-80%);
				mask: none !important;
				-webkit-mask: none !important;
				padding: 0.5rem;
				border-radius: 50%;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
			}
		}

		.homepage-posts-wrapper {
			position: relative;

			width: 100%;

			transition: mask-image 0.2s ease-in-out;

			&.start {
				mask-image: linear-gradient(to right, transparent 0%, var(--sk-bg-1) 10%);
				mask-size: 100%;
			}

			button {
				position: absolute;
				color: var(--sk-fg-3);
				cursor: pointer;
			}

			button.end {
				position: absolute;
				right: 0;
				top: 50%;

				translate: 0 -80%;

				color: var(--sk-fg-3);
			}
		}

		.homepage-posts {
			/* Keep your existing layout styles */
			box-sizing: border-box;
			position: relative;
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 34rem;
			gap: 2rem;

			width: 100%;
			padding-bottom: 1rem;
			overflow-x: auto;
			overflow-y: hidden;
			scroll-snap-type: x mandatory;
			padding-inline-end: 10em;
			scroll-padding-left: 4em;

			transition: mask-image 0.2s ease-in-out;

			&.end {
				/* Keep the end gradient mask, which always applies */
				mask-image: linear-gradient(to right, #fff 90%, transparent 100%);
				mask-size: 100%;
			}

			:global {
				article {
					scroll-snap-align: start;
				}
			}
		}
	}
	/* nav {
		top: 0;
		left: 0;
		color: var(--sk-fg-2);
		position: relative;

		a {
			color: var(--sk-fg-2);
		}
	}

	.sidebar {
		font-family: var(--sk-font-family-body);
		height: 100%;
		bottom: auto;
		width: 100%;
		margin: 0;

		list-style: none;

		accent-color: var(--sk-fg-accent);

		li {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	} */

	.container {
		/* max-width: var(--sk-page-content-width); */
		box-sizing: content-box;
		margin: 0 auto;
		text-wrap: balance;
		/* padding: var(--sk-page-padding-top) var(--sk-page-padding-side); */

		--sidebar-menu-width: 28rem;
		--sidebar-width: var(--sidebar-menu-width);

		display: flex;
		flex-direction: column;
	}

	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);

		min-width: 0 !important;
	}

	.page :global(:where(h2, h3) code) {
		all: unset;
	}

	.controls {
		background: var(--background);
		display: flex;
		gap: 1rem;
		font: var(--sk-font-ui-medium);

		form {
			display: contents;
		}

		/* b {
			font-size: large;
		}

		select {
			width: 100%;
			padding: 1rem;
			box-sizing: border-box;
		} */
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;

		border-radius: 0.5rem;
		border: solid 1px var(--sk-border);
		padding: 1rem;
		margin-block-start: 1rem;

		position: relative;

		&:has(:focus-visible) {
			outline: 2px solid var(--sk-fg-accent);
			outline-offset: 4px;
		}

		input {
			font: var(--sk-font-ui-medium);
			width: 100%;
			color: var(--sk-fg-1);
			background: inherit;
			border: none;
			outline: none;

			&::placeholder {
				color: var(--sk-fg-4);
				opacity: 0.5;
			}
		}

		button {
			position: absolute;
			right: 0;
			top: 0;
			height: 100%;
			aspect-ratio: 1;
			color: var(--sk-fg-4);

			&:hover,
			&:focus {
				color: var(--sk-fg-1);
			}

			&:focus-visible {
				outline-offset: -2px;
			}
		}
	}

	.posts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(37rem, 1fr));
		/* grid-auto-rows: 0.8fr; */
		gap: 2rem;
		flex-direction: column;
		margin-block-start: 4rem;
	}

	.pagination {
		width: calc(100%);
		display: flex;
		justify-content: center;

		span {
			opacity: 0.5;
		}

		a,
		span {
			width: 2rem;
			text-align: center;
			font: var(--sk-font-ui-medium);
		}

		a[aria-current='true'] {
			color: var(--sk-fg-accent);
			text-decoration: underline;
		}
	}

	/* .tag {
		&[aria-current='true'] {
			color: var(--sk-fg-accent);
			text-decoration: underline;
		}
	} */

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sk-page-padding-side));
		}
	}

	/* .toc-container {
		display: none;
		padding-top: calc(var(--sk-nav-height) + var(--sk-banner-height));
	} */

	@media (min-width: 832px) {
		/* .toc-container {
			display: block;
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-height));
			position: fixed;
			right: 100px;
			top: var(--sk-nav-height);
			overflow: hidden;

			&::after {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				width: 3px;
				height: 100%;
				background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.03));
			}
		} */

		.page {
			padding-left: calc(var(--sk-page-padding-side));
		}
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(
				26rem,
				calc(
					0.4 *
						(
							100vw - var(--sk-page-content-width) - var(--sk-page-padding-side) -
								var(--sk-page-padding-side)
						)
				)
			);
			flex-direction: row;
		}

		.page {
			--on-this-page-display: block;
			padding: var(--sk-page-padding-top) calc(4 * var(--sk-page-padding-side));
			margin: 0 auto;
			box-sizing: content-box;
			width: 100%;
		}
	}
</style>
