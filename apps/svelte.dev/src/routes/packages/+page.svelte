<script lang="ts">
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { QueryParamSerde, reactive_query_params } from '@sveltejs/site-kit/reactivity';
	import { onMount, tick } from 'svelte';
	import PackageCard from './PackageCard.svelte';
	import { search_criteria, type SortCriterion } from './packages-search';
	import Category from './Category.svelte';

	const { data } = $props();

	const qps = reactive_query_params({
		query: QueryParamSerde.string(),
		svelte_versions: QueryParamSerde.array(),
		sort_by: QueryParamSerde.string<SortCriterion>('popularity')
	});

	let packages = $derived(data.packages);

	const formatter = new Intl.NumberFormat();
	const formatted_package_number = $derived(formatter.format(data.packages_count));

	let ready = $state(false);
	let uid = 1;

	let worker_first_run = true;

	let worker: Worker;
	onMount(() => {
		worker = new Worker(new URL('./packages-worker.ts', import.meta.url), { type: 'module' });

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				packages = payload.results;
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
		qps.svelte_versions;
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
				svelte_versions: $state.snapshot(qps.svelte_versions),
				sort_by: qps.sort_by
			}
		});
	});
</script>

<svelte:head>
	<title>Packages • Svelte</title>

	<meta name="twitter:title" content="Packages • Svelte" />
	<meta name="twitter:description" content="Packages for your Svelte and SvelteKit apps" />
	<meta name="Description" content="Packages for your Svelte and SvelteKit apps" />
</svelte:head>

<h1 class="visually-hidden">Packages</h1>

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
					placeholder="Search {formatted_package_number} packages"
					aria-describedby="search-description"
					aria-label="Search"
					spellcheck="false"
				/>

				<button
					class="raised icon"
					aria-label="Clear"
					onclick={(e) => {
						e.stopPropagation();
						qps.query = '';
					}}
				>
					<Icon name="close" />
				</button>
			</label>

			{#if qps.query}
				<div class="sub">
					<span>Showing {packages?.length ?? 0} results</span>

					<span style="flex: 1 1 auto"></span>

					<div>
						Svelte versions:
						<label>
							<input type="checkbox" bind:group={qps.svelte_versions} value="3" />
							3
						</label>

						<label>
							<input type="checkbox" bind:group={qps.svelte_versions} value="4" />
							4
						</label>

						<label>
							<input type="checkbox" bind:group={qps.svelte_versions} value="5" />
							5
						</label>
					</div>

					<label>
						Sort By:
						<select bind:value={qps.sort_by}>
							{#each search_criteria as criterion}
								<option value={criterion}>{criterion}</option>
							{/each}
						</select>
					</label>

					<!-- <label>
							Hide outdated:
							<input type="checkbox" bind:checked={qps.hide_outdated} />
						</label> -->
				</div>
			{/if}
		</form>
	</div>

	{#if !qps.query}
		{#each data.homepage as { title, packages }}
			<Category {title} {packages} />
		{/each}
	{/if}

	<div class="posts" style="display: {!qps.query ? 'none' : null}">
		<!-- {#if packages.sv_add.length > 0}
				<h2>sv add</h2>
				<section>
					{#each packages.sv_add as pkg}
						<PackageCard {pkg} />
					{/each}
				</section>
			{/if} -->

		{#if packages.length > 0}
			<section>
				{#each packages as pkg}
					<PackageCard {pkg} />
				{/each}
			</section>
		{/if}
	</div>
</div>

<style>
	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);

		min-width: 0 !important;
		max-width: 140rem;
		margin: 0 auto;
		text-wrap: balance;
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
		margin: 0 0 4rem 0;

		form {
			display: contents;
		}

		input {
			accent-color: var(--sk-fg-accent);
		}

		.sub {
			display: flex;
			gap: 2rem;
		}
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
			right: 4px;
			top: 50%;
			translate: 0 -50%;
			height: max-content;
			aspect-ratio: 1;
			color: var(--sk-fg-4);
			background: var(--sk-bg-3);

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
		margin-block-start: 2rem;
		& > section {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(37rem, 1fr));
			/* grid-auto-rows: 0.8fr; */
			gap: 2rem;
			flex-direction: column;
			margin-block-start: 2rem;
			margin-block-end: 4rem;
		}
	}
</style>
