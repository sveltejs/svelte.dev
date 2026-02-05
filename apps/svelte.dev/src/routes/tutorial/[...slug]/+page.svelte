<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import * as adapter from './adapter.svelte';
	import { Workspace, type Item } from '@sveltejs/repl/workspace';
	import ContextMenu from './filetree/ContextMenu.svelte';
	import Filetree from './filetree/Filetree.svelte';
	import ImageViewer from './ImageViewer.svelte';
	import Output from './Output.svelte';
	import { ScreenToggle } from '@sveltejs/site-kit/components';
	import Sidebar from './Sidebar.svelte';
	import { solution } from './state.svelte';
	import { needs_webcontainers, text_files } from './shared';
	import OutputRollup from './OutputRollup.svelte';
	import { page } from '$app/state';
	import Controls from './Controls.svelte';
	import Editor from '@sveltejs/repl/editor';
	import type { Snapshot, PageProps } from './$types.js';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let path = data.exercise.path;
	let show_editor = $state(false);
	let show_filetree = $state(false);
	let paused = $state(false);
	let w = $state(1000);

	let previous_files: Item[] = [];

	function create_files(map: Record<string, string>): Record<string, Item> {
		const files: Record<string, Item> = {};

		const to_delete: string[] = [];

		for (const key in map) {
			const contents = map[key];

			if (contents.startsWith('__delete')) {
				continue;
			}

			const parts = key.split('/');
			const basename = parts.pop()!;
			const ext = basename.slice(basename.lastIndexOf('.'));

			if (basename === '__delete') {
				to_delete.push(`/${parts.join('/')}`);
				continue;
			}

			while (parts.length > 0) {
				const dir = `/${parts.join('/')}`;
				const basename = parts.pop()!;

				files[dir] ??= {
					type: 'directory',
					name: dir,
					basename
				};
			}

			const name = `/${key}`;

			files[name] = {
				type: 'file',
				name,
				basename,
				contents,
				text: text_files.has(ext)
			};
		}

		for (const dir of to_delete) {
			for (const key in files) {
				if (key === dir || key.startsWith(dir + '/')) {
					delete files[key];
				}
			}
		}

		return files;
	}

	function is_completed(files: Item[], solution: Record<string, Item> | null) {
		if (!solution) return true;

		for (const file of files) {
			if (file.type === 'file') {
				const expected = solution[file.name];
				if (expected?.type !== 'file') return false;
				if (normalise(file.contents) !== normalise(expected.contents)) return false;
			}
		}

		const names = new Set(files.map((stub) => stub.name));

		for (const name in solution) {
			if (!names.has(name)) return false;
		}

		return true;
	}

	function normalise(code: string) {
		// TODO think about more sophisticated normalisation (e.g. truncate multiple newlines)
		return code.replace(/\s+/g, ' ').trim();
	}

	function select_file(name: string | null) {
		const file = name && workspace.files.find((file) => file.name === name);

		if (!file && name) {
			// create intermediate directories if necessary
			const parent = name.split('/').slice(0, -1).join('/');

			if (!workspace.files.some((item) => item.name === parent)) {
				const basename = parent.split('/').pop()!;

				workspace.add({
					type: 'directory',
					name: parent,
					basename
				});
			}

			workspace.creating = {
				parent,
				type: 'file'
			};

			show_filetree = true;
		} else {
			show_filetree = false;

			if (name) {
				workspace.select(name);
			}
		}

		show_editor = true;
	}

	function navigate_to_file(name: string) {
		if (name === workspace.current.name) return;

		select_file(name);

		if (mobile) {
			const q = new URLSearchParams({ file: workspace.current.name || '' });
			history.pushState({}, '', `?${q}`);
		}
	}

	let sidebar = $state() as HTMLElement;

	export const snapshot: Snapshot<number> = {
		capture: () => {
			return sidebar.scrollTop;
		},
		restore: (scroll) => {
			scroll_was_restored = true;
			sidebar.scrollTop = scroll;
		}
	};

	let a = $derived(create_files(data.exercise.a));
	let b = $derived(create_files({ ...data.exercise.a, ...data.exercise.b }));

	// svelte-ignore state_referenced_locally
	const workspace = new Workspace(Object.values(a), {
		initial: data.exercise.focus,
		onupdate(file) {
			adapter.update(file);
		},
		onreset(items) {
			adapter.reset(items);
		}
	});

	// svelte-ignore state_referenced_locally
	solution.set(b);

	// for the things we can't do with media queries
	let mobile = $derived(w < 800);

	$effect(() => {
		// TODO get rid of this store/effect
		solution.set(b);
	});

	let scroll_was_restored = false;

	beforeNavigate(() => {
		scroll_was_restored = false;
		previous_files = workspace.files;
	});

	afterNavigate(async () => {
		if (!scroll_was_restored) {
			sidebar.scrollTop = 0;
		}

		workspace.reset(Object.values(a), { tailwind: false }, data.exercise.focus);

		const will_delete = previous_files.some((file) => !(file.name in a));

		if (data.exercise.path !== path || will_delete) paused = true;
		await adapter.reset(workspace.files);

		path = data.exercise.path;
		paused = false;
	});

	let completed = $derived(is_completed(workspace.files, b));
</script>

<svelte:head>
	<title>{data.exercise.chapter.title} / {data.exercise.title} • Svelte Tutorial</title>

	<meta name="twitter:title" content="{data.exercise.title} • Svelte Tutorial" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@sveltejs" />
	<meta name="twitter:creator" content="@sveltejs" />
	<meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
	<meta property="twitter:domain" content="https://svelte.dev" />
	<meta property="twitter:url" content="https://svelte.dev/tutorial" />

	<meta property="og:title" content="{data.exercise.title} • Svelte Tutorial" />
	<meta property="og:url" content="https://svelte.dev/tutorial" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
</svelte:head>

<svelte:window
	bind:innerWidth={w}
	onpopstate={(e) => {
		const q = new URLSearchParams(location.search);
		const file = q.get('file');

		if (file) {
			show_editor = true;
			select_file(file || null); // empty string === null
		} else {
			show_editor = false;
		}
	}}
/>

<ContextMenu />

<div class="container" class:mobile>
	<Controls
		index={data.index}
		exercise={data.exercise}
		{completed}
		toggle={() => {
			workspace.set(Object.values(completed ? a : b));
		}}
		{workspace}
	/>

	<div class="top" class:offset={show_editor}>
		<SplitPane id="main" type="horizontal" min="360px" max="50%" pos="33%">
			{#snippet a()}
				<section class="content">
					<Sidebar
						bind:sidebar
						exercise={data.exercise}
						on:select={(e) => {
							navigate_to_file(e.detail.file);
						}}
					/>
				</section>
			{/snippet}

			{#snippet b()}
				<SplitPane type="vertical" min="100px" max="-4.1rem" pos="50%">
					{#snippet a()}
						<SplitPane
							id="editor"
							type={mobile ? 'vertical' : 'horizontal'}
							min={mobile ? '40px' : '120px'}
							max={mobile ? '40px' : '300px'}
							pos={mobile ? '40px' : '200px'}
						>
							{#snippet a()}
								<section class="navigator">
									{#if mobile}
										<button class="file" onclick={() => (show_filetree = !show_filetree)}>
											{workspace.current.name.replace(
												data.exercise.scope.prefix,
												data.exercise.scope.name + '/'
											) ?? 'Files'}
										</button>
									{:else}
										<Filetree exercise={data.exercise} {workspace} />
									{/if}
								</section>
							{/snippet}

							{#snippet b()}
								<section class="editor-container">
									<Editor
										{workspace}
										autocomplete_filter={(file) => {
											return (
												file.name.startsWith('/src') &&
												file.name.startsWith(data.exercise.scope.prefix) &&
												file.name !== '/src/__client.js' &&
												file.name !== '/src/app.html'
											);
										}}
									/>
									<ImageViewer selected={workspace.current} />

									{#if mobile && show_filetree}
										<div class="mobile-filetree">
											<Filetree mobile exercise={data.exercise} {workspace} />
										</div>
									{/if}
								</section>
							{/snippet}
						</SplitPane>
					{/snippet}

					{#snippet b()}
						<section class="preview">
							{#if needs_webcontainers(page.data.exercise)}
								<Output exercise={data.exercise} {paused} {workspace} />
							{:else}
								<OutputRollup />
							{/if}
						</section>
					{/snippet}
				</SplitPane>
			{/snippet}
		</SplitPane>
	</div>

	<div class="screen-toggle">
		<ScreenToggle
			left="show text"
			right="show editor"
			onchange={(checked) => {
				show_editor = checked;

				const url = new URL(location.origin + location.pathname);

				if (show_editor) {
					url.searchParams.set('file', workspace.current.name ?? '');
				}

				history.pushState({}, '', url); // TODO use SvelteKit pushState
			}}
			checked={show_editor}
		/>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: calc(100dvh - var(--sk-nav-height) - var(--sk-banner-height));
		/** necessary for innerWidth to be correct, so we can determine `mobile` */
		width: 100vw;
		overflow: hidden;
	}

	.top {
		width: 200vw;
		margin-left: -100vw;
		height: 0;
		flex: 1;
		transition: transform 0.2s;
		/* we transform the default state, rather than the editor state, because otherwise
		   the positioning of tooltips is wrong (doesn't take into account transforms) */
		transform: translate(50%, 0);
		border-top: 1px solid var(--sk-border);
	}

	.top.offset {
		transform: none;
	}

	.screen-toggle {
		height: var(--sk-pane-controls-height);
	}

	.content {
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 100%;
		height: 100%;
		background: var(--sk-bg-3);
		--menu-width: 5rem;
	}

	.navigator {
		position: relative;
		background: var(--sk-bg-2);
		display: flex;
		flex-direction: column;
		font: var(--sk-font-ui-small);
	}

	.preview {
		display: flex;
		flex-direction: column;
	}

	.editor-container {
		position: relative;
		background-color: var(--sk-bg-3);
	}

	.mobile .navigator .file {
		flex: 1;
		padding: 1rem;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		/* put ellipsis at start */
		direction: rtl;
		text-align: left;
	}

	.mobile-filetree {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}

	/* on mobile, override the <SplitPane> controls */
	@media (max-width: 799px) {
		:global([data-pane='main']) {
			--pos: 50% !important;
		}

		:global([data-pane='editor']) {
			--pos: 5.4rem !important;
		}

		:global([data-pane]) :global(svelte-split-pane-divider) {
			cursor: default;
		}
	}

	@media (min-width: 800px) {
		.top {
			width: 100vw;
			margin: 0;
			transform: none;
		}

		.screen-toggle {
			display: none;
		}
	}
</style>
