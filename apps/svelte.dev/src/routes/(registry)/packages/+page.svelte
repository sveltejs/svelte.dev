<script lang="ts">
	import { page } from '$app/state';
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { Box, ReactiveQueryParam } from '@sveltejs/site-kit/reactivity';
	import { onMount } from 'svelte';
	import SearchWorker from './packages-worker.ts?worker';

	const { data } = $props();

	const query_qp = new ReactiveQueryParam<string>('query');
	const page_qp = new ReactiveQueryParam<number>('page', {
		encode: (v) => v.toString(),
		decode: (v) => +v
	});
	const tags_qp = new ReactiveQueryParam<string[]>('tags', {
		encode: (v) => v.join(','),
		decode: (v) => v.split(',').filter(Boolean)
	});

	const registry = new Box(() => data.registry);
	const total_pages = new Box(() => data.pages.total_pages);

	let ready = $state(false);
	let uid = 1;
	const pending = new Set();

	let worker_first_run = true;

	let worker: Worker;
	onMount(() => {
		worker = new SearchWorker();

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'update-page') {
				page_qp.current = payload.page;
			}

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				registry.current = payload.results;
				total_pages.current = payload.total_pages;
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

	$inspect(tags_qp.current);

	$effect(() => {
		query_qp.current;
		tags_qp.current;
		page_qp.current;
		page.url;

		if (ready) {
			if (worker_first_run) {
				worker_first_run = false;
			} else {
				const id = uid++;
				pending.add(id);

				worker.postMessage({
					type: 'get',
					id,
					payload: {
						query: query_qp.current,
						page: page_qp.current,
						tags: $state.snapshot(tags_qp.current),
						url: page.url.toString()
					}
				});
			}
		}
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
	<div class="toc-container" style="order: 1">
		<nav aria-label="Docs">
			<ul class="sidebar">
				{#each [{ tag: 'all', short_title: 'All' }].concat(data.tags) as tag}
					{@const link = new URL(page.url)}
					{@const _ = link.searchParams.set(
						'tags',
						(tag.tag === 'all'
							? []
							: (link.searchParams.get('tags') ?? '').split(',').concat(tag.tag).filter(Boolean)
						).join(',')
					)}

					<li>
						<input
							type="checkbox"
							bind:group={tags_qp.current}
							value={tag.tag}
							bind:checked={() =>
								tag.tag === 'all'
									? tags_qp.current.length === 0
									: tags_qp.current.includes(tag.tag),
							(v) => {
								if (tag.tag !== 'all') {
									if (v) {
										tags_qp.current = [...tags_qp.current, tag.tag];
									} else {
										tags_qp.current = tags_qp.current.filter((t) => t !== tag.tag);
									}
								} else {
									tags_qp.current = [];
								}
							}}
						/>
						<a
							class="tag"
							href={link.pathname + link.search}
							onclick={(e) => {
								e.preventDefault();

								if (tag.tag === 'all') {
									// Click on this should just empty the tags array
									tags_qp.current = [];
									return;
								}

								if (tags_qp.current.includes(tag.tag)) {
									tags_qp.current = tags_qp.current.filter((t) => t !== tag.tag);
								} else {
									tags_qp.current = [...tags_qp.current, tag.tag];
								}
							}}
							aria-current={(tag.tag === 'all' && tags_qp.current.length === 0) ||
								tags_qp.current.includes(tag.tag)}
							title="Packages under {tag.tag}"
						>
							{tag.short_title}
						</a>
					</li>
				{/each}
			</ul>

			<div class="pagination">
				{#each Array(total_pages.current), i}
					{@const link = new URL(page.url)}
					{@const _ = link.searchParams.set('page', i + '')}
					<a
						href={link.pathname + link.search}
						aria-current={page_qp.current === i}
						onclick={(e) => {
							e.preventDefault();
							page_qp.current = i;
						}}>{i + 1}</a
					>&nbsp;
				{/each}
			</div>
		</nav>
	</div>
	<!-- <article class="top" data-pubdate={top.date}>
		<a href="/{top.slug}" title="Read the article »">
			<h2>{top.metadata.title}</h2>
			<p>{@html top.metadata.description}</p>
		</a>

		<!-- <Byline post={top} />
	</article> -->

	<div class="page content">
		<h1>Packages</h1>

		<div class="posts">
			<div class="controls">
				<div class="input-group">
					<input
						use:forcefocus
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.isComposing) {
								// const element = modal.querySelector('a[data-has-node]') as HTMLElement | undefined;
								// element?.click();
							}
						}}
						bind:value={query_qp.current}
						placeholder="Search"
						aria-describedby="search-description"
						aria-label={'Search'}
						spellcheck="false"
					/>

					<button aria-label="Clear" onclick={() => (query_qp.current = '')}>
						<Icon name="close" />
					</button>
				</div>

				<!-- <button class="raised" aria-label="Close" onclick={close}>
					<Icon name="close" />
					<kbd>Esc</kbd>
				</button> -->
			</div>

			{#each registry.current as pkg}
				<article data-pubdate={pkg.updated}>
					<a
						href="https://npmjs.com/package/{pkg.name}"
						target="_blank"
						rel="noreferrer noopener"
						title="Read the article »"
					>
						<h2>{pkg.name}</h2>
					</a>

					<p>{pkg.description}</p>

					<p class="tags">
						{pkg.tags.map((tag) => tag).join(', ')}
					</p>

					<!-- <Byline post={pkg} /> -->
				</article>
			{/each}
		</div>

		<!-- <ul class="feed">
			{#each [{ tag: 'all', short_title: 'All' }].concat(data.tags) as tag}
				{@const link = new URL(page.url)}
				{@const _ = link.searchParams.set(
					'tags',
					(tag.tag === 'all'
						? []
						: (link.searchParams.get('tags') ?? '').split(',').concat(tag.tag).filter(Boolean)
					).join(',')
				)}

				<li>
					<a
						class="tag"
						href={link.pathname + link.search}
						onclick={(e) => {
							e.preventDefault();

							if (tag.tag === 'all') {
								// Click on this should just empty the tags array
								tags_qp.current = [];
								return;
							}

							if (tags_qp.current.includes(tag.tag)) {
								tags_qp.current = tags_qp.current.filter((t) => t !== tag.tag);
							} else {
								tags_qp.current = [...tags_qp.current, tag.tag];
							}
						}}
						aria-current={(tag.tag === 'all' && tags_qp.current.length === 0) ||
							tags_qp.current.includes(tag.tag)}
						title="Packages under {tag.tag}"
					>
						{tag.short_title}
					</a>
				</li>
			{/each}
		</ul> -->
	</div>
</div>

<style>
	nav {
		top: 0;
		left: 0;
		color: var(--sk-fg-2);
		position: relative;

		a {
			color: var(--sk-fg-2);
		}
	}

	.sidebar {
		padding: 3.2rem 3.2rem calc(3.2rem + var(--sk-banner-height)) 3.2rem;
		font-family: var(--sk-font-family-body);
		height: 100%;
		bottom: auto;
		width: 100%;
		margin: 0;

		list-style: none;

		accent-color: var(--sk-fg-accent);
	}

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
		padding: 0.5rem;
		display: flex;
		gap: 1rem;
	}

	.input-group {
		position: relative;
		flex: 1;

		input {
			font: var(--sk-font-ui-large);
			width: 100%;
			padding: var(--padding) 6rem var(--padding) calc(var(--padding) - 0.5rem);
			height: 6rem;
			border: none;
			flex-shrink: 0;
			color: var(--sk-fg-1);
			border-bottom: 1px solid var(--sk-border);
			background: inherit;

			&::placeholder {
				color: var(--sk-fg-4);
				opacity: 0.5;
			}

			&:focus-visible {
				outline-offset: -2px;
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
				color: var(--sk-fg-3);
			}

			&:focus-visible {
				outline-offset: -2px;
			}
		}
	}

	h2 {
		display: inline-block;
		color: var(--sk-fg-1);
		font: var(--sk-font-h3);
	}

	article {
		margin: 0 0 4rem 0;

		a {
			display: block;
			text-decoration: none;
			color: inherit;

			&:hover h2 {
				text-decoration: underline;
			}
		}

		.tags {
			display: flex;
			gap: 0.5rem;
			font: var(--sk-font-ui-medium);
			font-family: var(--sk-font-family-mono);
		}

		p {
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
			margin: 0 0 0.5em 0;
		}
	}

	.pagination {
		display: flex;

		a {
			font: var(--sk-font-ui-medium);
		}

		a[aria-current='true'] {
			color: var(--sk-fg-accent);
			text-decoration: underline;
		}
	}

	.tag {
		&[aria-current='true'] {
			color: var(--sk-fg-accent);
			text-decoration: underline;
		}
	}

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	.toc-container {
		background: var(--sk-bg-2);
		display: none;

		:root.dark & {
			background: var(--sk-bg-0);
		}
	}

	@media (min-width: 832px) {
		.toc-container {
			display: block;
			width: var(--sidebar-width);
			height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-height));
			position: fixed;
			left: 0;
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
		}

		.page {
			padding-left: calc(var(--sidebar-width) + var(--sk-page-padding-side));
		}
	}

	@media (min-width: 1200px) {
		.container {
			--sidebar-width: max(
				28rem,
				calc(
					0.5 *
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
			padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
			margin: 0 auto;
			box-sizing: content-box;
			width: 100%;
		}
	}
</style>
