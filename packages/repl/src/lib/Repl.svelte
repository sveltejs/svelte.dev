<script lang="ts">
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import { ScreenToggle } from '@sveltejs/site-kit/components';
	import { BROWSER } from 'esm-env';
	import { writable } from 'svelte/store';
	import Bundler from './Bundler.js';
	import ComponentSelector from './Input/ComponentSelector.svelte';
	import Output from './Output/Output.svelte';
	import { set_repl_context } from './context.js';
	import { Workspace, Editor, type File } from 'editor';
	import type { Bundle, ReplContext } from './types.js';

	interface Props {
		packagesUrl?: string;
		svelteUrl?: any;
		embedded?: boolean;
		orientation?: 'columns' | 'rows';
		relaxed?: boolean;
		can_escape?: boolean;
		fixed?: boolean;
		fixedPos?: number;
		injectedJS?: string;
		injectedCSS?: string;
		previewTheme?: 'light' | 'dark';
		onchange?: () => void;
	}

	let {
		packagesUrl = 'https://unpkg.com',
		svelteUrl = `${BROWSER ? location.origin : ''}/svelte`,
		embedded = false,
		orientation = 'columns',
		relaxed = false,
		can_escape = false,
		fixed = false,
		fixedPos = 50,
		injectedJS = '',
		injectedCSS = '',
		previewTheme = 'light',
		onchange = () => {}
	}: Props = $props();

	// TODO pass in real data
	const dummy: File = {
		type: 'file',
		name: 'App.svelte',
		basename: 'App.svelte',
		contents: '',
		text: true
	};

	const workspace = new Workspace([dummy], {
		initial: 'App.svelte',
		svelte_version: svelteUrl.split('@')[1],
		onupdate() {
			rebundle();
			onchange?.();
		},
		onreset() {
			rebundle();
		}
	});

	// TODO get rid
	export function toJSON() {
		return {
			imports: $bundle?.imports ?? [],
			files: workspace.files
		};
	}

	// TODO get rid
	export async function set(data: { files: File[]; css?: string }) {
		workspace.reset(data.files, 'App.svelte');
	}

	// TODO get rid
	export function markSaved() {
		workspace.mark_saved();
	}

	const bundle: ReplContext['bundle'] = writable(null);
	const toggleable: ReplContext['toggleable'] = writable(false);

	set_repl_context({
		bundle,
		toggleable,

		migrate,

		workspace
	});

	let current_token: Symbol;

	async function rebundle() {
		const token = (current_token = Symbol());
		const result = await bundler!.bundle(workspace.files as File[]);
		if (token === current_token) $bundle = result as Bundle;
	}

	async function migrate() {
		if (!can_migrate) return; // belt and braces — button is already disabled

		workspace.update_file({
			...workspace.current!,
			contents: migration!.code
		});

		rebundle();
	}

	let width = $state(0);
	let show_output = $state(false);
	let status: string | null = $state(null);
	let status_visible = $state(false);
	let status_timeout: NodeJS.Timeout | undefined = undefined;

	const bundler = BROWSER
		? new Bundler({
				packages_url: packagesUrl,
				svelte_url: svelteUrl,
				onstatus: (message) => {
					if (message) {
						// show bundler status, but only after time has elapsed, to
						// prevent the banner flickering
						if (!status_visible && !status_timeout) {
							status_timeout = setTimeout(() => {
								status_visible = true;
							}, 400);
						}
					} else {
						clearTimeout(status_timeout);
						status_visible = false;
						status_timeout = undefined;
					}

					status = message;
				}
			})
		: null;

	function before_unload(event: BeforeUnloadEvent) {
		if (Object.keys(workspace.modified).length > 0) {
			event.preventDefault();
			event.returnValue = '';
		}
	}
	let mobile = $derived(width < 540);

	$effect(() => {
		$toggleable = mobile && orientation === 'columns';
	});

	let runes = $derived(
		workspace.current.name.endsWith('.svelte.js') ||
			(workspace.compiled[workspace.current.name!]?.result?.metadata.runes ?? false)
	);

	let migration = $derived(workspace.compiled[workspace.current.name!]?.migration);
	let can_migrate = $derived(migration ? migration.code !== workspace.current?.contents : false);
</script>

<svelte:window onbeforeunload={before_unload} />

<div class="container" class:embedded class:toggleable={$toggleable} bind:clientWidth={width}>
	<div class="viewport" class:output={show_output}>
		<SplitPane
			--color="var(--sk-text-4)"
			id="main"
			type={orientation === 'rows' ? 'vertical' : 'horizontal'}
			pos="{mobile || fixed ? fixedPos : orientation === 'rows' ? 60 : 50}%"
			min="100px"
			max="-4.1rem"
		>
			<section slot="a">
				<ComponentSelector {runes} {onchange} {workspace} {can_migrate} />

				<Editor {workspace} />
			</section>

			<section slot="b" style="height: 100%;">
				<Output
					status={status_visible ? status : null}
					{embedded}
					{relaxed}
					{can_escape}
					{injectedJS}
					{injectedCSS}
					{previewTheme}
					{workspace}
				/>
			</section>
		</SplitPane>
	</div>

	{#if $toggleable}
		<ScreenToggle bind:checked={show_output} />
	{/if}
</div>

<style>
	.container {
		position: relative;
		flex: 1;
		height: 100%;
		min-height: 0;
		background: var(--sk-back-1);
		padding: 0;

		&.embedded {
			height: 100%;
		}

		:global {
			section {
				position: relative;
				padding: var(--sk-pane-controls-height) 0 0 0;
				height: 100%;
				box-sizing: border-box;

				& > :first-child {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: var(--sk-pane-controls-height);
					box-sizing: border-box;
				}

				& > :last-child {
					width: 100%;
					height: 100%;
				}
			}

			.divider::after {
				background-color: var(--sk-back-5);
			}

			[data-pane='main'] > .divider::after {
				height: calc(100% - var(--sk-pane-controls-height));
				top: var(--sk-pane-controls-height);
			}
		}
	}

	.viewport {
		height: 100%;
	}

	.toggleable .viewport {
		width: 200%;
		height: calc(100% - var(--sk-pane-controls-height));
		transition: transform 0.3s;
	}

	.toggleable .viewport.output {
		transform: translate(-50%);
	}

	/* on mobile, override the <SplitPane> controls */
	@media (max-width: 799px) {
		:global {
			[data-pane='main'] {
				--pos: 50% !important;
			}

			[data-pane='editor'] {
				--pos: 5.4rem !important;
			}

			[data-pane] .divider {
				cursor: default;
			}
		}
	}
</style>
