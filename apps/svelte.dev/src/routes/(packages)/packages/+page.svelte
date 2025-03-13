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

	const number_formatter = Intl.NumberFormat();
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
							value={tag.tag}
							bind:checked={() =>
								tag.tag === 'all'
									? tags_qp.current.length === 0
									: tags_qp.current.includes(tag.tag),
							(v) => {
								if (tag.tag === 'all') {
									// Click on this should just empty the tags array
									tags_qp.current = [];
									return;
								}

								if (!v) {
									tags_qp.current = tags_qp.current.filter((t) => t !== tag.tag);
								} else {
									tags_qp.current = [...tags_qp.current, tag.tag];
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
						<h2 class={[(pkg.outdated || pkg.deprecated) && 'faded']}>{pkg.name}</h2>
						<span class="status">
							{#if pkg.outdated}
								<span>outdated</span>
							{/if}
							{#if pkg.deprecated}
								<span>deprecated</span>
							{/if}
						</span>
					</a>

					<p>{pkg.description}</p>

					<br />

					<p class="tags">
						{pkg.tags.map((tag) => tag).join(', ')}
					</p>

					<p class="stats">
						{#if pkg.github_stars}
							<span title="{pkg.github_stars} Github Stars">
								{number_formatter.format(pkg.github_stars)}
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
									><!-- Icon from All by undefined - undefined --><path
										fill="currentColor"
										d="M9.6 15.65L12 13.8l2.4 1.85l-.9-3.05l2.25-1.6h-2.8L12 7.9l-.95 3.1h-2.8l2.25 1.6zm2.4.65l-3.7 2.825q-.275.225-.6.213t-.575-.188t-.387-.475t-.013-.65L8.15 13.4l-3.625-2.575q-.3-.2-.375-.525t.025-.6t.35-.488t.6-.212H9.6l1.45-4.8q.125-.35.388-.538T12 3.475t.563.188t.387.537L14.4 9h4.475q.35 0 .6.213t.35.487t.025.6t-.375.525L15.85 13.4l1.425 4.625q.125.35-.012.65t-.388.475t-.575.188t-.6-.213zm0-4.525"
									/></svg
								>
							</span>
						{/if}

						{#if pkg.downloads}
							<span title="{pkg.downloads} downloads">
								{number_formatter.format(+pkg.downloads)}
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
									><!-- Icon from All by undefined - undefined --><path
										fill="currentColor"
										d="M12.554 16.506a.75.75 0 0 1-1.107 0l-4-4.375a.75.75 0 0 1 1.107-1.012l2.696 2.95V3a.75.75 0 0 1 1.5 0v11.068l2.697-2.95a.75.75 0 1 1 1.107 1.013z"
									/><path
										fill="currentColor"
										d="M3.75 15a.75.75 0 0 0-1.5 0v.055c0 1.367 0 2.47.117 3.337c.12.9.38 1.658.981 2.26c.602.602 1.36.86 2.26.982c.867.116 1.97.116 3.337.116h6.11c1.367 0 2.47 0 3.337-.116c.9-.122 1.658-.38 2.26-.982s.86-1.36.982-2.26c.116-.867.116-1.97.116-3.337V15a.75.75 0 0 0-1.5 0c0 1.435-.002 2.436-.103 3.192c-.099.734-.28 1.122-.556 1.399c-.277.277-.665.457-1.4.556c-.755.101-1.756.103-3.191.103H9c-1.435 0-2.437-.002-3.192-.103c-.734-.099-1.122-.28-1.399-.556c-.277-.277-.457-.665-.556-1.4c-.101-.755-.103-1.756-.103-3.191"
									/></svg
								>
							</span>
						{/if}

						{#if pkg.dependents}
							<span title="{pkg.dependents} dependents">
								{number_formatter.format(+pkg.dependents)}
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
									><!-- Icon from All by undefined - undefined --><path
										fill="currentColor"
										d="M7.35 20.98q-.984 0-1.677-.683q-.692-.685-.692-1.662q0-.84.534-1.49q.533-.65 1.331-.816V7.67q-.798-.165-1.331-.815q-.534-.65-.534-1.49q0-.986.689-1.676T7.343 3t1.676.69t.693 1.676q0 .84-.524 1.49t-1.342.815v.54q0 1.37.942 2.33q.943.959 2.289.959h1.846q1.748 0 2.98 1.249t1.232 3.02v.56q.817.165 1.35.806q.534.64.534 1.48q0 .986-.702 1.676q-.701.69-1.68.69t-1.664-.69t-.685-1.675q0-.841.524-1.481q.525-.64 1.323-.806v-.56q0-1.346-.937-2.307q-.937-.962-2.275-.962h-1.846q-1.004 0-1.834-.435q-.83-.436-1.397-1.161v5.425q.817.165 1.341.806q.524.64.524 1.48q0 .986-.689 1.676q-.688.69-1.673.69M7.356 20q.569 0 .962-.392t.393-.972t-.392-.973t-.973-.394q-.56 0-.962.403q-.403.403-.403.963t.403.962q.402.403.972.403m9.288 0q.57 0 .963-.392t.393-.972t-.392-.974t-.973-.393q-.56 0-.963.403t-.403.963t.403.962t.972.403M7.356 6.73q.569 0 .962-.391t.394-.972t-.393-.974T7.346 4q-.56 0-.962.403q-.403.403-.403.963t.403.962t.972.403"
									/></svg
								>
							</span>
						{/if}
					</p>
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

		li {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
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

		&.faded {
			color: var(--sk-fg-3);
		}
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

		.status {
			width: max-content;
			font: var(--sk-font-ui-medium);
			font-family: var(--sk-font-family-mono);
			margin-left: 0.5rem;

			> * {
				padding: 0.4rem 0.5rem;
				width: fit-content;
				border: 1px solid var(--sk-border);
				border-radius: 0.5rem;
			}
		}

		.tags {
			display: flex;
			gap: 0.5rem;
			font: var(--sk-font-ui-medium);
			font-family: var(--sk-font-family-mono);
		}

		.stats {
			display: flex;
			gap: 1.6rem;
			font: var(--sk-font-ui-medium);
			font-family: var(--sk-font-family-mono);

			span {
				display: flex;
				gap: 0.1rem;
				align-items: center;
			}
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
