<script lang="ts">
	import { page } from '$app/state';
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { ReactiveQueryParam } from '@sveltejs/site-kit/reactivity';
	import { onMount } from 'svelte';
	import { search_criteria, type SortCriterion, type SortDirection } from '../packages-search';
	import Pagination from './pagination.svelte';

	const { data } = $props();

	const query_qp = new ReactiveQueryParam<string>('query');
	const page_qp = new ReactiveQueryParam<number>('page', 1, ReactiveQueryParam.number);
	const tags_qp = new ReactiveQueryParam<string[]>('tags', [], ReactiveQueryParam.array);
	const svelte_5_only_qp = new ReactiveQueryParam<boolean>(
		'svelte_5_only',
		false,
		ReactiveQueryParam.boolean
	);
	const show_outdated_qp = new ReactiveQueryParam<boolean>(
		'show_outdated',
		true,
		ReactiveQueryParam.boolean
	);
	const sort_by_qp = new ReactiveQueryParam<SortCriterion>('sort_by', 'popularity');
	const direction_qp = new ReactiveQueryParam<SortDirection>('direction', 'dsc');

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
				page_qp.current = payload.page;
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

	$inspect(svelte_5_only_qp.current);

	$effect(() => {
		query_qp.current;
		tags_qp.current;
		page_qp.current;
		svelte_5_only_qp.current;
		show_outdated_qp.current;
		sort_by_qp.current;
		direction_qp.current;

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
				query: query_qp.current,
				page: page_qp.current,
				tags: $state.snapshot(tags_qp.current),
				svelte_5_only: svelte_5_only_qp.current,
				show_outdated: show_outdated_qp.current,
				sort_by: sort_by_qp.current,
				direction: direction_qp.current
			}
		});
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
	<div class="page content">
		<h1>Packages</h1>

		<div class="posts">
			{#each registry as pkg}
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
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="1.5em"
									width="1.5em"
									viewBox="0 0 512 512"
									style="translate: 0 2px;"
								>
									<!-- Top cube - slightly larger -->
									<path
										d="M256 100 L346 150 L256 200 L166 150 Z"
										fill="none"
										stroke="currentColor"
										stroke-width="24"
									/>

									<!-- Connection lines - slightly curved for better visual flow -->
									<path
										d="M226 180 Q206 210 176 230"
										fill="none"
										stroke="currentColor"
										stroke-width="20"
									/>
									<path
										d="M286 180 Q306 210 336 230"
										fill="none"
										stroke="currentColor"
										stroke-width="20"
									/>

									<!-- Bottom left cube - positioned for better balance -->
									<path
										d="M176 230 L246 280 L176 330 L106 280 Z"
										fill="none"
										stroke="currentColor"
										stroke-width="20"
									/>

									<!-- Bottom right cube - positioned for better balance -->
									<path
										d="M336 230 L406 280 L336 330 L266 280 Z"
										fill="none"
										stroke="currentColor"
										stroke-width="20"
									/>
								</svg></span
							>
						{/if}
					</p>
				</article>
			{/each}

			<div class="pagination">
				<Pagination total={total_pages} bind:page={page_qp.current}>
					{#snippet children(pageItem)}
						{#if pageItem.type === 'ellipsis'}
							<span>-</span>
						{:else}
							{@const url = new URL(page.url)}
							{@const _ = url.searchParams.set('page', pageItem.value.toString())}
							<a
								href={url.pathname + url.search}
								aria-current={page_qp.current === pageItem.value}
								onclick={(e) => {
									e.preventDefault();
									page_qp.current = pageItem.value;
								}}
							>
								{pageItem.value}
							</a>
						{/if}
					{/snippet}
				</Pagination>
			</div>
		</div>
	</div>

	<div class="toc-container">
		<nav aria-label="Docs">
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
						bind:value={query_qp.current}
						placeholder="Search"
						aria-describedby="search-description"
						aria-label={'Search'}
						spellcheck="false"
					/>

					<button
						aria-label="Clear"
						onclick={(e) => {
							e.stopPropagation();
							query_qp.current = '';
						}}
					>
						<Icon name="close" />
					</button>
				</label>

				<label>
					<select bind:value={sort_by_qp.current}>
						{#each search_criteria as criterion}
							<option value={criterion}>{criterion}</option>
						{/each}
					</select>
				</label>

				<label>
					<input type="radio" bind:group={direction_qp.current} value="asc" />
					<span>Ascending</span>

					<input type="radio" bind:group={direction_qp.current} value="dsc" />
					<span>Descending</span>
				</label>
			</div>

			<ul class="sidebar">
				<b>FILTERS</b>
				<li>
					<a
						class="tag"
						href={svelte_5_only_qp.url_from(!svelte_5_only_qp.current)}
						onclick={(e) => {
							e.preventDefault();
							svelte_5_only_qp.current = !svelte_5_only_qp.current;
						}}
						aria-current={svelte_5_only_qp.current}
						title="Show Svelte 5 packages"
					>
						Svelte 5 only
					</a>
				</li>
				<li>
					<a
						class="tag"
						href={show_outdated_qp.url_from(!show_outdated_qp.current)}
						onclick={(e) => {
							e.preventDefault();
							show_outdated_qp.current = !show_outdated_qp.current;
						}}
						aria-current={show_outdated_qp.current}
					>
						Outdated
					</a>
				</li>
			</ul>

			<br /><br />
			<ul class="sidebar">
				<b>TAGS</b>
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
			</ul>
		</nav>
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
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font: var(--sk-font-ui-medium);

		select {
			width: 100%;
			padding: 1rem;
			box-sizing: border-box;
		}
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
		display: flex;
		flex-direction: column;
		margin-block-start: 4rem;
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
			max-width: calc(100% - var(--sidebar-width));
		}
	}

	.pagination {
		width: calc(100% - var(--sidebar-width));
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

	.tag {
		&[aria-current='true'] {
			color: var(--sk-fg-accent);
			text-decoration: underline;
		}
	}

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sk-page-padding-side));
		}
	}

	.toc-container {
		display: none;
		padding-top: calc(var(--sk-nav-height) + var(--sk-banner-height));
	}

	@media (min-width: 832px) {
		.toc-container {
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
		}

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
			padding: var(--sk-page-padding-top) calc(var(--sidebar-width) + var(--sk-page-padding-side));
			margin: 0 auto;
			box-sizing: content-box;
			width: 100%;
		}
	}
</style>
