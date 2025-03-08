<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { forcefocus } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import { onMount, tick, untrack } from 'svelte';
	import SearchWorker from './registry-worker.ts?worker';

	class Box<T> {
		#getter: () => T;
		#setter?: (value: T) => void;

		#derived = $derived.by(() => {
			let val = $state(this.#getter());

			return {
				get current() {
					return val;
				},
				set current(value) {
					val = value;
				}
			};
		});

		constructor(getter: () => T, setter?: (value: T) => void) {
			this.#getter = getter;
			this.#setter = setter;

			$effect(() => {
				this.#setter?.($state.snapshot(this.#derived.current) as T);
			});
		}

		get current(): T {
			return this.#derived.current;
		}

		set current(value: T) {
			this.#derived.current = value;
		}
	}

	const { data } = $props();

	const query = new Box(
		() => page.url.searchParams.get('query') ?? '',
		(val) => {
			page.url.searchParams.set('query', val);

			// So we don't run it when router hasn't initialized yet
			tick().then(() => replaceState(page.url, {}));
		}
	);

	const registry = new Box(() => data.registry);

	let ready = $state(false);
	let uid = 1;
	const pending = new Set();

	let worker_first_run = true;

	let worker: Worker;
	onMount(() => {
		worker = new SearchWorker();

		worker.addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'ready') {
				ready = true;
			}

			if (type === 'results') {
				console.log(payload);
				registry.current = payload.results;
			}

			// if (type === 'recents') {
			// 	recent_searches = payload;
			// }
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
		query.current;

		if (ready) {
			if (worker_first_run) {
				worker_first_run = false;
			} else {
				console.log(1);
				const id = uid++;
				pending.add(id);

				worker.postMessage({
					type: 'get',
					id,
					payload: {
						query: query.current,
						path: page.url.pathname
					}
				});
			}
		}
	});
</script>

<svelte:head>
	<title>Registry • Svelte</title>
	<!-- <link
		rel="alternate"
		type="application/rss+xml"
		title="Svelte blog"
		href="https://svelte.dev/blog/rss.xml"
	/> -->

	<meta name="twitter:title" content="Registry • Svelte" />
	<meta name="twitter:description" content="Articles about Svelte and UI development" />
	<meta name="Description" content="Articles about Svelte and UI development" />
</svelte:head>

<h1 class="visually-hidden">Registry</h1>

<div class="container">
	<!-- <article class="top" data-pubdate={top.date}>
		<a href="/{top.slug}" title="Read the article »">
			<h2>{top.metadata.title}</h2>
			<p>{@html top.metadata.description}</p>
		</a>

		<!-- <Byline post={top} />
	</article> -->

	<div class="grid">
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
						bind:value={query.current}
						placeholder="Search"
						aria-describedby="search-description"
						aria-label={'Search'}
						spellcheck="false"
					/>

					<button aria-label="Clear" onclick={() => (query.current = '')}>
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
					<a href="#{pkg.name}" title="Read the article »">
						<h2>{pkg.name}</h2>
						<p>{pkg.description?.replace(/"/g, '').trim()}</p>
					</a>

					<!-- <Byline post={pkg} /> -->
				</article>
			{/each}
		</div>

		<ul class="feed">
			<li>
				<a
					href="?tag=all"
					title="All Packages"
					class="tag"
					aria-current={!page.url.searchParams.has('tag') ||
						page.url.searchParams.get('tag') === 'all'}
				>
					All
				</a>
			</li>
			{#each data.tags as tag}
				<li>
					<a
						class="tag"
						href="?tag={tag.tag}"
						aria-current={tag.tag === page.url.searchParams.get('tag')}
						title="Packages under {tag.tag}"
					>
						{tag.short_title}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.container {
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: 0 auto;
		text-wrap: balance;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
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

	h2 {
		display: inline-block;
		color: var(--sk-fg-1);
		font: var(--sk-font-h3);
	}

	article {
		margin: 0 0 4rem 0;

		/* &.top {
			margin: 0 0 2rem 0;
			padding: 0 0 4rem 0;

			h2 {
				font: var(--sk-font-h1);
				color: var(--sk-fg-1);
			}
		} */

		a {
			display: block;
			text-decoration: none;
			color: inherit;

			&:hover h2 {
				text-decoration: underline;
			}
		}

		p {
			font: var(--sk-font-body-small);
			color: var(--sk-fg-3);
			margin: 0 0 0.5em 0;
		}
	}

	.feed {
		display: none;
	}

	.tag {
		&[aria-current='true'] {
			color: var(--sk-fg-accent);
			text-decoration: underline;
		}
	}

	@media (min-width: 800px) {
		.grid {
			display: grid;
			grid-template-columns: 3fr 1fr;
			gap: 3em;
		}

		/* .featured,
		.feed {
			padding: 4rem 0;
			position: relative;

			&::before {
				position: absolute;
				top: 0;
				font: var(--sk-font-ui-medium);
				text-transform: uppercase;
				color: var(--sk-fg-3);
			}
		} */

		/* .featured {
			display: block;

			&::before {
				content: 'Featured';
			}

			article {
				&:not(.feature) {
					display: none;
				}

				h2 {
					font: var(--sk-font-h2);
				}
			}
		} */

		.feed {
			display: block;
			margin: 0;
			list-style: none;

			&::before {
				content: 'Categories';
			}

			a {
				display: block;
				font: var(--sk-font-body);
				color: inherit;
			}
		}
	}
</style>
