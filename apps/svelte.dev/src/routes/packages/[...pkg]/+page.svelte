<script lang="ts">
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { QueryParamSerde, reactive_query_params } from '@sveltejs/site-kit/reactivity';
	import { fly } from 'svelte/transition';
	import Category from '../Category.svelte';
	import PackageCard from '../PackageCard.svelte';
	import { search } from '../search';
	import PackageDetails from '../PackageDetails.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';

	const { data } = $props();

	const qps = reactive_query_params({
		query: QueryParamSerde.string(),
		svelte_versions: QueryParamSerde.array()
	});

	const filtered = $derived(search(data.packages, qps.query, qps.svelte_versions));
	let selected = $derived(data.selected);

	const formatter = new Intl.NumberFormat();

	function select(pkg: string) {
		page.url.pathname = page.url.pathname + '/' + pkg;
		replaceState(page.url, { selected: pkg });
		selected = data.packages.find((p) => p.name === pkg);
	}

	function deselect() {
		page.url.pathname = page.url.pathname.split(selected!.name)[0].replace(/\/$/, '');
		replaceState(page.url, { selected: undefined });
		selected = undefined;
	}
</script>

<svelte:head>
	<title>Packages • Svelte</title>

	<meta name="twitter:title" content="Packages • Svelte" />
	<meta name="twitter:description" content="Packages for your Svelte and SvelteKit apps" />
	<meta name="Description" content="Packages for your Svelte and SvelteKit apps" />
</svelte:head>

<h1 class="visually-hidden">Packages</h1>

<div class={['page content', !!selected && 'split']}>
	<div class="listing" style="min-width: 0;">
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
						placeholder="Search {formatter.format(data.packages.length)} packages"
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
						<span>Showing {formatter.format(filtered.length)} results</span>

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
					</div>
				{/if}
			</form>
		</div>

		{#if qps.query}
			<div in:fly={{ y: 20 }} class="posts">
				<section>
					{#each filtered as pkg}
						<PackageCard {pkg} {select} />
					{/each}
				</section>
			</div>
		{:else}
			<div in:fly={{ y: 20 }}>
				{#each data.homepage as { title, packages }}
					<Category {title} {packages} {select} />
				{/each}
			</div>
		{/if}
	</div>

	<div>
		{#if selected}
			<PackageDetails pkg={selected} {deselect} />
		{/if}
	</div>
	<!-- {/if} -->
</div>

<style>
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	.page {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);

		min-width: 0 !important;
		max-width: 140rem;
		margin: 0 auto;
		text-wrap: balance;

		.listing {
			padding-inline: 0.75rem;
		}

		&.split {
			display: grid;
			grid-template-columns: 5fr 4fr;
			gap: 2rem;

			padding-bottom: 0;

			max-width: unset;

			.listing {
				/* max-width: unset; */
				min-height: 0;
				height: 90dvh;
				overflow-y: auto;
			}
		}
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
