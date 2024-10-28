<!-- @component
Renders a search box as an overlay that can be used to search the documentation.
It appears when the user clicks on the `Search` component or presses the corresponding keyboard shortcut.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { overlay_open, search_query, search_recent, searching } from '../stores';
	import { onMount, type Snippet } from 'svelte';
	import { focusable_children, forcefocus, trap } from '../actions/focus.js';
	import Icon from '../components/Icon.svelte';
	import SearchResults from './SearchResults.svelte';
	import SearchWorker from './search-worker.js?worker';

	interface Props {
		placeholder?: string;
		idle?: Snippet<[number]>;
		search_description?: Snippet;
		no_results?: Snippet;
	}

	let { placeholder = 'Search', idle, search_description, no_results }: Props = $props();

	let modal = $state() as HTMLElement;

	// TODO proper types
	let search: any = $state(null);
	let recent_searches: any[] = $state([]);

	let last_scroll_position: number | null = null;

	let worker: Worker;
	let ready = $state(false);

	let uid = 1;
	const pending = new Set();

	onMount(async () => {
		worker = new SearchWorker();

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				search = payload;
			}

			if (type === 'recents') {
				recent_searches = payload;
			}
		});

		worker.postMessage({
			type: 'init',
			payload: {
				origin: location.origin
			}
		});
	});

	afterNavigate(() => {
		// TODO this also needs to apply when only the hash changes
		// (should before/afterNavigate fire at that time? unclear)
		close();
	});

	async function close() {
		if ($searching) {
			$searching = false;
			const scroll = last_scroll_position || 0;
			last_scroll_position = null;
			document.body.style.position = '';
			document.body.tabIndex = -1;
			document.body.focus();
			document.body.removeAttribute('tabindex');
			window.scrollTo(0, scroll);

			$search_query = '';
		}

		search = null;
	}

	function navigate(href: string) {
		$search_recent = [href, ...$search_recent.filter((x) => x !== href)];
		close();
	}

	$effect(() => {
		if (ready) {
			const id = uid++;
			pending.add(id);

			worker.postMessage({ type: 'query', id, payload: $search_query });
		}
	});

	$effect(() => {
		if (ready) {
			worker.postMessage({ type: 'recents', payload: $state.snapshot($search_recent) });
		}
	});

	$effect(() => {
		$overlay_open = $searching;
	});

	$effect(() => {
		if ($searching) {
			last_scroll_position = window.scrollY;
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'k' && (navigator.platform === 'MacIntel' ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
			$search_query = '';

			if ($searching) {
				close();
			} else {
				$searching = true;
			}
		}

		if (e.code === 'Escape') {
			close();
		}
	}}
/>

{#if $searching && ready}
	<div class="pseudo-overlay" aria-hidden="true" onclick={close}></div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={modal}
		class="modal"
		onkeydown={(e) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				const group = focusable_children(e.currentTarget);

				// when using arrow keys (as opposed to tab), don't focus buttons
				const selector = 'a, input';

				if (e.key === 'ArrowDown') {
					group.next(selector);
				} else {
					group.prev(selector);
				}
			}
		}}
		use:trap
	>
		<div class="search-box">
			<div style="background: var(--background); padding: 0.5rem">
				<input
					use:forcefocus
					onkeydown={(e) => {
					if (e.key === 'Enter' && !e.isComposing) {
						const element = modal.querySelector('a[data-has-node]') as HTMLElement | undefined;
						element?.click();
					}
				}}
					oninput={(e) => {
						$search_query = e.currentTarget.value;
					}}
					value={$search_query}
					{placeholder}
					aria-describedby="search-description"
					aria-label={placeholder}
					spellcheck="false"
				/>
			</div>

			<button aria-label="Close" onclick={close}>
				<!-- <Icon name="close" /> -->
				<kbd>Esc</kbd>
			</button>

			<span id="search-description" class="visually-hidden">
				{#if search_description}
					{@render search_description()}
				{:else}
					Results will update as you type
				{/if}
			</span>

			<div class="results">
				{#if search?.query}
					<div class="results-container">
						<SearchResults
							results={search.results}
							query={search.query}
							onselect={(href) => {
								navigate(href);
							}}
						/>
					</div>
				{:else}
					<span class="info" class:empty={recent_searches.length === 0}>
						{#if idle}
							{@render idle(recent_searches.length)}
						{:else}
							{recent_searches.length ? 'Recent searches' : 'No recent searches'}
						{/if}
					</span>

					{#if recent_searches.length}
						<div class="results-container">
							<ul class="recent">
								{#each recent_searches as search}
									<li>
										<a onclick={() => navigate(search.href)} href={search.href}>
											{search.breadcrumbs.at(-1)}
										</a>

										<button
											aria-label="Delete"
											onclick={(e) => {
												$search_recent = $search_recent.filter((href) => href !== search.href);
												e.stopPropagation();
												e.preventDefault();
											}}
										>
											<Icon name="delete" />
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<div aria-live="assertive" class="visually-hidden">
	{#if $searching && search?.results.length === 0}
		<p>
			{#if no_results}
				{@render no_results()}
			{:else}
				No results
			{/if}
		</p>
	{/if}
</div>

<style>
	.pseudo-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 100;
	}

	.modal {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
	}

	.search-box {
		--padding: 1rem;
		--background: var(--sk-back-2);
		/* background: var(--background); */
		position: relative;
		height: calc(100% - 2rem);
		width: calc(100vw - 2rem);
		max-width: 64rem;
		max-height: 64rem;
		filter: drop-shadow(2px 4px 16px rgba(0, 0, 0, 0.2));
		border-radius: var(--sk-border-radius);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--sk-font-family-ui);

		@media (min-width: 800px) {
			--padding: 1.6rem;
		}

		& > * {
			pointer-events: all;
		}
	}

	input {
		font: var(--sk-font-ui-large);
		width: 100%;
		padding: calc(var(--padding) - 0.5rem) 5rem calc(var(--padding) - 0.5rem) var(--padding);
		height: 6rem;
		border: none;
		border-bottom: 1px solid var(--sk-back-3);
		flex-shrink: 0;
		background: var(--sk-back-3);
		color: var(--sk-text-1);

		&::selection {
			background-color: var(--sk-back-translucent);
		}

		&::placeholder {
			color: var(--sk-text-2);
			opacity: 0.3;
		}

		&:focus-visible {
			outline-offset: -3px;
		}
	}

	button[aria-label='Close'] {
		--size: 2rem;
		position: absolute;
		top: 0.5rem;
		right: 0;
		width: 5rem;
		height: 6rem;
		background: none;
		color: var(--sk-text-2);
		opacity: 0.3;

		&:focus-visible {
			opacity: 1;
			outline-offset: -3px;
		}

		kbd {
			text-transform: uppercase;
			font: var(--sk-font-ui-small);
		}
	}

	ul {
		margin: 0;
	}

	.results {
		overflow: auto;
		overscroll-behavior-y: none;
	}

	.results-container {
		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		pointer-events: all;
		background: var(--background);

		li {
			position: relative;

			a {
				color: var(--sk-text-2);
				display: block;
				text-decoration: none;
				padding: 0.5rem calc(4rem + var(--padding)) 0.5rem var(--padding);

				&:hover {
					background: rgba(0, 0, 0, 0.05);
				}

				&:focus {
					outline-offset: -3px;
				}
			}

			button[aria-label='Delete'] {
				position: absolute;
				top: 0;
				right: 0;
				width: 5rem;
				height: 100%;
				color: var(--sk-text-2);
				opacity: 0.1;

				&:hover {
					opacity: 1;
					outline: none;
				}

				&:focus-visible {
					opacity: 1;
					outline-offset: -3px;
				}
			}
		}

		.recent {
			padding-bottom: 1rem;

			a {
				font: var(--sk-font-ui-medium);
			}
		}
	}

	.info {
		display: block;
		background: var(--background);
		padding: var(--padding);
		font: var(--sk-font-ui-medium);
		color: var(--sk-text-4);
		text-transform: uppercase;
		pointer-events: all;

		&.empty {
			border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		}
	}
</style>
