<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import * as adapter from './adapter.svelte';
	import { Editor, Workspace } from 'editor';
	import ContextMenu from './filetree/ContextMenu.svelte';
	import Filetree from './filetree/Filetree.svelte';
	import ImageViewer from './ImageViewer.svelte';
	import Output from './Output.svelte';
	import { ScreenToggle } from '@sveltejs/site-kit/components';
	import Sidebar from './Sidebar.svelte';
	import { solution } from './state.svelte';
	import { create_directories } from './utils';
	import { needs_webcontainers, text_files } from './shared';
	import OutputRollup from './OutputRollup.svelte';
	import { page } from '$app/stores';
	import Controls from './Controls.svelte';
	import type { Item } from 'editor';
	import type { Snapshot } from './$types.js';
	import { tick } from 'svelte';

	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	let path = data.exercise.path;
	let show_editor = $state(false);
	let show_filetree = $state(false);
	let paused = $state(false);
	let w = $state(1000);

	let editor: any; // TODO
	let skip_set_files = true;

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
			// trigger file creation input. first, create any intermediate directories
			const new_directories = create_directories(name, workspace.files);

			if (new_directories.length > 0) {
				workspace.reset_files([...workspace.files, ...new_directories]);
			}

			// find the parent directory
			const parent = name.split('/').slice(0, -1).join('/');

			workspace.creating = {
				parent,
				type: 'file'
			};

			show_filetree = true;
		} else {
			show_filetree = false;
			workspace.selected_name = name;
		}

		show_editor = true;
	}

	function navigate_to_file(name: string) {
		if (name === workspace.selected_name) return;

		select_file(name);

		if (mobile) {
			const q = new URLSearchParams({ file: workspace.selected_name || '' });
			history.pushState({}, '', `?${q}`);
		}
	}

	let sidebar = $state() as HTMLElement;

	// TODO this doesn't seem to work any more?
	export const snapshot: Snapshot<number> = {
		capture: () => {
			const scroll = sidebar.scrollTop;
			sidebar.scrollTop = 0;
			return scroll;
		},
		restore: (scroll) => {
			sidebar.scrollTop = scroll;
		}
	};

	let a = $derived(create_files(data.exercise.a));
	let b = $derived(create_files({ ...data.exercise.a, ...data.exercise.b }));

	const workspace = new Workspace({
		files: Object.values(a),
		selected_name: data.exercise.focus,
		onupdate(file) {
			adapter.update(file);
		},
		onreset(items) {
			adapter.reset(items);
		}
	});

	solution.set(b);

	// for the things we can't do with media queries
	let mobile = $derived(w < 800);

	$effect(() => {
		workspace.files = Object.values(a);
	});

	$effect(() => {
		solution.set(b);
	});

	$effect(() => {
		workspace.selected_name = data.exercise.focus; // TODO this probably belongs in afterNavigate
	});

	beforeNavigate(() => {
		skip_set_files = true;
		previous_files = workspace.files;
	});

	afterNavigate(async () => {
		skip_set_files = false;

		editor.reset();

		w = window.innerWidth;

		const will_delete = previous_files.some((file) => !(file.name in a));

		if (data.exercise.path !== path || will_delete) paused = true;
		await adapter.reset(workspace.files);

		path = data.exercise.path;
		paused = false;
	});

	$effect(() => {
		const files = workspace.files; // capture the dependency. TODO don't use an effect here
		if (!skip_set_files) editor.update_files(files);
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
			workspace.reset_files(Object.values(completed ? a : b));
		}}
	/>

	<div class="top" class:offset={show_editor}>
		<SplitPane id="main" type="horizontal" min="360px" max="50%" pos="33%">
			<section slot="a" class="content">
				<Sidebar
					bind:sidebar
					exercise={data.exercise}
					on:select={(e) => {
						navigate_to_file(e.detail.file);
					}}
				/>
			</section>

			<section slot="b">
				<SplitPane type="vertical" min="100px" max="-4.1rem" pos="50%">
					<section slot="a">
						<SplitPane
							id="editor"
							type={mobile ? 'vertical' : 'horizontal'}
							min="120px"
							max="300px"
							pos="200px"
						>
							<section slot="a" class="navigator">
								{#if mobile}
									<button class="file" onclick={() => (show_filetree = !show_filetree)}>
										{workspace.selected_name?.replace(
											data.exercise.scope.prefix,
											data.exercise.scope.name + '/'
										) ?? 'Files'}
									</button>
								{:else}
									<Filetree
										exercise={data.exercise}
										{workspace}
										on:select={(e) => {
											select_file(e.detail.name);
										}}
									/>
								{/if}
							</section>

							<section slot="b" class="editor-container">
								<Editor
									bind:this={editor}
									errors={adapter.adapter_state.errors}
									warnings={adapter.adapter_state.warnings}
									{workspace}
									onchange={async (file, contents) => {
										skip_set_files = true;

										workspace.update_file({ ...file, contents });

										await tick();
										skip_set_files = false;
									}}
									autocomplete_filter={(file) => {
										return (
											file.name.startsWith('/src') &&
											file.name.startsWith(data.exercise.scope.prefix) &&
											file.name !== '/src/__client.js' &&
											file.name !== '/src/app.html'
										);
									}}
								/>
								<ImageViewer selected={workspace.selected_file} />

								{#if mobile && show_filetree}
									<div class="mobile-filetree">
										<Filetree
											mobile
											exercise={data.exercise}
											{workspace}
											on:select={(e) => {
												navigate_to_file(e.detail.name);
											}}
										/>
									</div>
								{/if}
							</section>
						</SplitPane>
					</section>

					<section slot="b" class="preview">
						{#if needs_webcontainers($page.data.exercise)}
							<Output exercise={data.exercise} {paused} {workspace} />
						{:else}
							<OutputRollup />
						{/if}
					</section>
				</SplitPane>
			</section>
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
					url.searchParams.set('file', workspace.selected_name ?? '');
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
		height: calc(100dvh - var(--sk-nav-height));
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
		border-top: 1px solid var(--sk-back-5);
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
		background: var(--sk-back-3);
		--menu-width: 5rem;
	}

	.navigator {
		position: relative;
		background: var(--sk-back-2);
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
		background-color: var(--sk-back-3);
	}

	.mobile .navigator {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 1rem;
		gap: 1rem;
	}

	.mobile .navigator .file {
		flex: 1;
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

		:global([data-pane]) :global(.divider) {
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
