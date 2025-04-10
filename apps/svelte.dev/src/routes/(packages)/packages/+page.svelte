<script lang="ts">
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { QueryParamSerde, reactive_query_params } from '@sveltejs/site-kit/reactivity';
	import { onMount, tick } from 'svelte';
	import { on } from 'svelte/events';
	import PackageCard from './PackageCard.svelte';
	import { search_criteria, type SortCriterion } from './packages-search';

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

	const scroll_states = $state(
		Array.from({ length: data.homepage?.length || 0 }, () => ({ start: false, end: true }))
	);

	let homepage_card_width = $state<number | null>(null);

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

	// This function is first run on onMount to enable/disable the arrow buttons, and on scroll
	function handle_scroll(node: HTMLElement, idx: number) {
		function update() {
			homepage_card_width = (node.children[0] as HTMLElement)?.offsetWidth;

			const width = node.offsetWidth;
			const scroll_width = node.scrollWidth;
			const scroll_left = node.scrollLeft;

			scroll_states[idx].start = scroll_left !== 0;
			scroll_states[idx].end = scroll_left + width !== scroll_width;
		}

		tick().then(update);

		$effect(() => {
			if (!qps.query) {
				update();
			}
		});

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

		<section class="homepage" style="display: {qps.query ? 'none' : null}">
			<br /><br />
			{#each data.homepage ?? [] as { packages, title }, idx}
				<section>
					<h2>{title}</h2>
					<div class="homepage-wrapper-wrapper">
						<button
							class={['start raised icon', scroll_states[idx].start && 'visible']}
							onclick={on_previous}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"
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

						<div class={['homepage-posts-wrapper', scroll_states[idx].start && 'start']}>
							<div
								class={['homepage-posts', scroll_states[idx].end && 'end']}
								use:handle_scroll={idx}
							>
								{#each packages as pkg}
									<PackageCard {pkg} />
								{/each}
							</div>

							<button
								class={['end raised icon', scroll_states[idx].end && 'visible']}
								onclick={on_next}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"
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
						</div>
					</div>
				</section>
				<br /><br /><br /><br />
			{/each}
		</section>

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
				background: var(--sk-bg-3);

				opacity: 0;

				left: 0;
				top: 50%;
				z-index: 100;
				translate: 0 -80%;
				mask: none !important;
				-webkit-mask: none !important;

				&.visible {
					opacity: 1;
				}
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
				background: var(--sk-bg-3);
			}

			button.end {
				position: absolute;
				right: 0;
				top: 50%;

				translate: 0 -80%;

				color: var(--sk-fg-3);

				opacity: 0;

				&.visible {
					opacity: 1;
				}
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
			padding-inline-end: 10em;

			/* scrollbar-width: none; Firefox */
			/* -ms-overflow-style: none; IE and Edge */
			overflow-x: auto;
			overflow-y: hidden;
			scroll-snap-type: x mandatory;
			scroll-padding-left: 4em;

			transition: mask-image 0.2s ease-in-out;

			/* &::-webkit-scrollbar {
				display: none;
			} */

			&.end {
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

	.container {
		box-sizing: content-box;
		margin: 0 auto;
		text-wrap: balance;

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

	@media (min-width: 832px) {
		.content {
			padding-left: calc(var(--sk-page-padding-side));
		}
	}

	@media (min-width: 832px) {
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
