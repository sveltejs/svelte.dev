<script lang="ts">
	import { page } from '$app/state';
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { QueryParamSerde, reactive_query_params } from '@sveltejs/site-kit/reactivity';
	import { onMount } from 'svelte';
	import { type SortCriterion } from '../packages-search';
	import Pagination from './Pagination.svelte';
	import { PACKAGES_META } from '$lib/packages-meta';
	import PackageCard from './PackageCard.svelte';

	const { data } = $props();

	const qps = reactive_query_params({
		query: QueryParamSerde.string(),
		page: QueryParamSerde.number(1),
		svelte_5_only: QueryParamSerde.boolean(),
		hide_outdated: QueryParamSerde.boolean(),
		sort_by: QueryParamSerde.string<SortCriterion>('popularity')
	});

	let registry = $derived(data.registry);
	let total_pages = $derived(data.pages.total_pages);

	let ready = $state(false);
	let uid = 1;

	let worker_first_run = true;

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
</script>

<svelte:head>
	<title>Packages • Svelte</title>
	<!-- <link
		rel="alternate"
		type="application/rss+xml"
		title="Svelte blog"
		href="https://svelte.dev/blog/rss.xml"
	/> -->

	<meta name="twitter:title" content="Packages • Svelte" />
	<meta name="twitter:description" content="Articles about Svelte and UI development" />
	<meta name="Description" content="Articles about Svelte and UI development" />
</svelte:head>

<h1 class="visually-hidden">Packages</h1>

<div class="container">
	<div class="page content">
		<div class="controls">
			<label class="input-group">
				<Icon name="search" />
				<input
					use:forcefocus
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.isComposing) {
							// const element = modal.querySelector('a[data-has-node]') as HTMLElement | undefined;
							// element?.click();
						}
					}}
					bind:value={qps.query}
					placeholder="Search"
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
		</div>

		{#if !qps.query && data.homepage}
			<br /><br />

			<section class="homepage">
				<!-- Here we show netflix style page -->
				{#each data.homepage as { packages, title }}
					<section>
						<h2>{title}</h2>
						<div class="homepage-posts">
							{#each packages as pkg}
								<PackageCard {pkg} />
							{/each}
						</div>
					</section>
					<br /><br /><br /><br />
				{/each}
			</section>
		{:else}
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

	<!-- <div class="toc-container">
		<nav aria-label="Docs">
			<div class="controls">
				<b>SORT BY</b>
				<label>
					<select bind:value={qps.sort_by}>
						{#each search_criteria as criterion}
							<option value={criterion}>{criterion}</option>
						{/each}
					</select>
				</label>
			</div>

			<br /><br />

			<ul class="sidebar">
				<b>FILTERS</b>
				<li>
					<input type="checkbox" value="svelte_5_only" bind:checked={qps.svelte_5_only} />
					<a
						class="tag"
						href={qps.url_from('svelte_5_only', !qps.svelte_5_only)}
						onclick={(e) => {
							e.preventDefault();
							qps.svelte_5_only = !qps.svelte_5_only;
						}}
						aria-current={qps.svelte_5_only}
						title="Show Svelte 5 packages"
					>
						Svelte 5 only
					</a>
				</li>
				<li>
					<input type="checkbox" value="svelte_5_only" bind:checked={qps.hide_outdated} />
					<a
						class="tag"
						href={qps.url_from('hide_outdated', !qps.hide_outdated)}
						onclick={(e) => {
							e.preventDefault();
							qps.hide_outdated = !qps.hide_outdated;
						}}
						aria-current={qps.hide_outdated}
					>
						Hide Outdated
					</a>
				</li>
			</ul>

			<br /><br />
		</nav>
	</div> -->
</div>

<style>
	.homepage {
		h2 {
			margin-bottom: 2rem;
		}

		.homepage-posts {
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 34rem;
			gap: 2rem;

			width: 100%;
			overflow-x: auto;
			overflow-y: hidden;

			scroll-snap-type: x mandatory;

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
		flex-direction: column;
		gap: 1rem;
		font: var(--sk-font-ui-medium);

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
		padding: 0.5rem 0.5rem 0.5rem 0rem;
		margin-block-start: 1rem;

		position: relative;

		&:has(:focus-visible) {
			outline: 2px solid var(--sk-fg-accent);
			outline-offset: 4px;
		}

		/* Border that is not rounded */
		&::after {
			content: '';
			position: absolute;
			inset-block-end: 0;
			inset-inline: 0;
			height: 1px;
			background: var(--sk-border);
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
		gap: 4rem;
		flex-direction: column;
		margin-block-start: 4rem;

		:global {
			article {
				margin-bottom: 2rem;
			}
		}
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
