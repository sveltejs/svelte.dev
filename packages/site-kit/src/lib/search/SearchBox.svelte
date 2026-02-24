<!-- @component
Renders a search box as an overlay that can be used to search the documentation.
It appears when the user clicks on the `Search` component or presses the corresponding keyboard shortcut.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { overlay_open } from '../stores';
	import { search } from '../state/search.svelte';
	import { onMount, type Snippet } from 'svelte';
	import { focusable_children, forcefocus, trap } from '../actions/focus.js';
	import Icon from '../components/Icon.svelte';
	import SearchResults from './SearchResults.svelte';
	import { page } from '$app/stores';

	interface Props {
		placeholder?: string;
		idle?: Snippet<[number]>;
		search_description?: Snippet;
		no_results?: Snippet;
	}

	let { placeholder = 'Search', idle, search_description, no_results }: Props = $props();

	let modal = $state() as HTMLElement;

	// TODO proper types
	let searched: any = $state(null);
	let recent_searches: any[] = $state([]);

	let last_scroll_position: number | null = null;

	let worker: Worker;
	let ready = $state(false);

	let uid = 1;
	const pending = new Set();

	onMount(async () => {
		worker = new Worker(new URL('./search-worker', import.meta.url), {
			type: 'module'
		});

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				searched = payload;
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
		if (search.active) {
			search.active = false;
			const scroll = last_scroll_position || 0;
			last_scroll_position = null;
			document.body.style.position = '';
			document.body.tabIndex = -1;
			(document.activeElement as HTMLElement)?.blur();
			document.body.removeAttribute('tabindex');
			window.scrollTo(0, scroll);

			search.query = '';
		}

		searched = null;
	}

	function navigate(href: string) {
		search.recent = [href, ...search.recent.filter((x) => x !== href)];
		close();
	}

	$effect(() => {
		if (ready) {
			const id = uid++;
			pending.add(id);

			worker.postMessage({
				type: 'query',
				id,
				payload: {
					query: search.query,
					path: $page.url.pathname
				}
			});
		}
	});

	$effect(() => {
		if (ready) {
			worker.postMessage({ type: 'recents', payload: search.recent });
		}
	});

	$effect(() => {
		$overlay_open = search.active;
	});

	$effect(() => {
		if (search.active) {
			last_scroll_position = window.scrollY;
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (
			e.key === 'k' &&
			!e.shiftKey &&
			(navigator.platform === 'MacIntel' ? e.metaKey : e.ctrlKey)
		) {
			e.preventDefault();
			search.query = '';

			if (search.active) {
				close();
			} else {
				search.active = true;
			}
		}

		if (e.key === 'Escape') {
			close();
		}
	}}
/>

{#if search.active && ready}
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
			<div class="controls">
				<div class="input-group">
					<input
						use:forcefocus
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.isComposing) {
								const element = modal.querySelector('a[data-has-node]') as HTMLElement | undefined;
								element?.click();
							}
						}}
						oninput={(e) => {
							search.query = e.currentTarget.value;
						}}
						value={search.query}
						{placeholder}
						aria-describedby="search-description"
						aria-label={placeholder}
						spellcheck="false"
					/>

					<button aria-label="Clear" onclick={() => (search.query = '')}>
						<Icon name="close" />
					</button>
				</div>

				<button class="raised" aria-label="Close" onclick={close}>
					<!-- <Icon name="close" /> -->
					<kbd>Esc</kbd>
				</button>
			</div>

			<span id="search-description" class="visually-hidden">
				{#if search_description}
					{@render search_description()}
				{:else}
					Results will update as you type
				{/if}
			</span>

			<div class="results">
				{#if searched?.query}
					<div class="results-container">
						<SearchResults
							results={searched.results}
							query={searched.query}
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
								{#each recent_searches as result}
									<li>
										<a onclick={() => navigate(result.href)} href={result.href}>
											{result.breadcrumbs.at(-1)}
										</a>

										<button
											class="raised icon"
											aria-label="Delete"
											onclick={(e) => {
												search.recent = search.recent.filter((href) => href !== result.href);
												e.stopPropagation();
												e.preventDefault();
											}}
										>
											<Icon name="delete" size={16} />
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
	{#if search.active && searched?.results.length === 0}
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
		--background: var(--sk-bg-2);
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

	button[aria-label='Close'] {
		height: 100%;
		aspect-ratio: 1;
		background: none;

		&:hover,
		&:focus {
			color: var(--sk-fg-3);
		}

		&:focus-visible {
			outline-offset: -2px;
		}

		kbd {
			display: flex;
			align-items: center;
			justify-content: center;
			text-transform: uppercase;
			background: none;
			font: var(--sk-font-ui-medium);
			color: var(--sk-fg-4);
			width: 100%;
			height: 100%;
		}
	}

	ul {
		margin: 0;
	}

	.results {
		overflow: auto;
		overscroll-behavior-y: none;
		scrollbar-color: var(--sk-scrollbar) var(--sk-bg-2);
	}

	.results-container {
		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		pointer-events: all;
		background: var(--background);

		li {
			position: relative;
			display: flex;
			padding: 0.2rem var(--padding);
			gap: 1rem;

			&:hover {
				background: var(--sk-bg-3);
			}

			a {
				color: inherit;
				display: block;
				text-decoration: none;
				margin: 0 -0.5rem;
				padding: 0.5rem;
				flex: 1;

				&:focus {
					outline-offset: -3px;
				}
			}

			button[aria-label='Delete'] {
				width: 3.2rem;
				height: 3.2rem;
				color: var(--sk-fg-4);
				background-color: var(--sk-bg-2);

				&:hover {
					outline: none;
					color: var(--sk-fg-3);
				}

				&:focus-visible {
					color: var(--sk-fg-3);
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
		color: var(--sk-fg-4);
		text-transform: uppercase;
		pointer-events: all;

		&.empty {
			border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		}
	}
</style>
