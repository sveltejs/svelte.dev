<script lang="ts">
	import UserMenu from './UserMenu.svelte';
	import { Icon } from '@sveltejs/site-kit/components';
	import * as doNotZip from 'do-not-zip';
	import downloadBlob from './downloadBlob.js';
	import { enter } from '$lib/utils/events';
	import { isMac } from '$lib/utils/compat.js';
	import { Repl } from '@sveltejs/repl';
	import { get_app_context } from '../../app-context';
	import type { Gist, User } from '$lib/db/types';
	import type { File } from '@sveltejs/repl';

	interface Props {
		user: User | null;
		repl: Repl;
		gist: Gist;
		name: string;
		zen_mode: boolean;
		modified_count: number;
		forked: (value: { gist: Gist }) => void;
		saved: () => void;
	}

	let {
		name = $bindable(),
		zen_mode = $bindable(),
		modified_count = $bindable(),
		user,
		repl,
		gist,
		forked,
		saved
	}: Props = $props();

	const { login } = get_app_context();

	let saving = $state(false);
	let downloading = $state(false);
	let justSaved = $state(false);
	let justForked = $state(false);

	function wait(ms: number) {
		return new Promise((f) => setTimeout(f, ms));
	}

	const canSave = $derived(user && gist && gist.owner === user.id);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 's' && (isMac ? event.metaKey : event.ctrlKey)) {
			event.preventDefault();
			save();
		}
	}

	async function fork(intentWasSave: boolean) {
		saving = true;

		const { files } = repl.toJSON() as { files: File[] };

		try {
			const r = await fetch(`/playground/create.json`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					files: files.map((file) => ({
						name: `${file.name}.${file.type}`,
						source: file.source
					}))
				})
			});

			if (r.status < 200 || r.status >= 300) {
				const { error } = await r.json();
				throw new Error(`Received an HTTP ${r.status} response: ${error}`);
			}

			const gist = await r.json();
			forked({ gist });

			modified_count = 0;
			repl.markSaved();

			if (intentWasSave) {
				justSaved = true;
				await wait(600);
				justSaved = false;
			} else {
				justForked = true;
				await wait(600);
				justForked = false;
			}
		} catch (err) {
			if (navigator.onLine) {
				alert((err as Error).message);
			} else {
				alert(`It looks like you're offline! Find the internet and try again`);
			}
		}

		saving = false;
	}

	async function save() {
		if (!user) {
			alert('Please log in before saving your app');
			return;
		}
		if (saving) return;

		if (!canSave) {
			fork(true);
			return;
		}

		saving = true;

		try {
			// Send all files back to API
			// ~> Any missing files are considered deleted!
			const { files } = repl.toJSON() as { files: File[] };

			const r = await fetch(`/playground/save/${gist.id}.json`, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					files: files.map((file) => ({
						name: `${file.name}.${file.type}`,
						source: file.source
					}))
				})
			});

			if (r.status < 200 || r.status >= 300) {
				const { error } = await r.json();
				throw new Error(`Received an HTTP ${r.status} response: ${error}`);
			}

			modified_count = 0;
			repl.markSaved();
			saved();
			justSaved = true;
			await wait(600);
			justSaved = false;
		} catch (err) {
			if (navigator.onLine) {
				alert((err as Error).message);
			} else {
				alert(`It looks like you're offline! Find the internet and try again`);
			}
		}

		saving = false;
	}

	async function download() {
		downloading = true;

		const { files: components, imports } = repl.toJSON() as {
			files: any[];
			imports: string[];
		};

		const files = (await (await fetch('/svelte-app.json')).json()) as Array<{
			path: string;
			data: string;
		}>;

		if (imports.length > 0) {
			const idx = files.findIndex(({ path }) => path === 'package.json');
			const pkg = JSON.parse(files[idx].data);
			const { devDependencies } = pkg;
			imports.forEach((mod) => {
				const match = /^(@[^/]+\/)?[^@/]+/.exec(mod)!;
				devDependencies[match[0]] = 'latest';
			});
			pkg.devDependencies = devDependencies;
			files[idx].data = JSON.stringify(pkg, null, '  ');
		}

		files.push(
			...components.map((component) => ({
				path: `src/${component.name}.${component.type}`,
				data: component.source
			}))
		);
		files.push({
			path: `src/main.js`,
			data: `import App from './App.svelte';

var app = new App({
	target: document.body
});

export default app;`
		});

		downloadBlob(doNotZip.toBlob(files), 'svelte-app.zip');

		downloading = false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app-controls">
	<input
		bind:value={name}
		onfocus={(e) => e.currentTarget.select()}
		use:enter={(e) => (e.currentTarget as HTMLInputElement).blur()}
	/>

	<div class="buttons">
		<button class="raised icon" onclick={() => (zen_mode = !zen_mode)} title="fullscreen editor">
			{#if zen_mode}
				<Icon size={18} name="close" />
			{:else}
				<Icon size={18} name="maximize" />
			{/if}
		</button>

		<button class="raised icon" disabled={downloading} onclick={download} title="download zip file">
			<Icon size={18} name="download" />
		</button>

		<button class="raised icon" disabled={saving || !user} onclick={() => fork(false)} title="fork">
			{#if justForked}
				<Icon size={18} name="check" />
			{:else}
				<Icon size={18} name="git-branch" />
			{/if}
		</button>

		<button class="raised icon" disabled={saving || !user} onclick={save} title="save">
			{#if justSaved}
				<Icon size={18} name="check" />
			{:else}
				<Icon size={18} name="save" />
				{#if modified_count}
					<div class="badge">{modified_count}</div>
				{/if}
			{/if}
		</button>

		{#if user}
			<UserMenu {user} />
		{:else}
			<button
				class="raised icon"
				onclick={(e) => (e.preventDefault(), login())}
				style="width: auto; padding: 0 0.4rem"
			>
				<Icon name="log-in" />
				<span>&nbsp;Log in to save</span>
			</button>
		{/if}
	</div>
</div>

<style>
	.app-controls {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: var(--app-controls-h);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem var(--sk-page-padding-side);
		background-color: var(--sk-back-2);
		color: var(--sk-text-1);
		white-space: nowrap;
		flex: 0;
		gap: 2rem;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			bottom: -4px;
			width: 100%;
			height: 4px;
			z-index: 2;
			background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
		}

		@media (min-width: 800px) {
			padding-top: 0;
			padding-bottom: 1rem;
		}
	}

	.buttons {
		text-align: right;
		display: flex;
		align-items: center;
		gap: 0.2em;
	}

	button {
		width: 3.2rem;
		height: 3.2rem;
	}

	.icon {
		transform: translateY(0.1rem);
		display: inline-block;
		transition: opacity 0.3s;
		font-family: var(--sk-font-ui);
		font-size: var(--sk-font-size-ui-small);
		color: var(--sk-text-3);
		line-height: 1;
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}
	.icon:disabled {
		opacity: 0.3;
	}

	.icon[title^='fullscreen'] {
		display: none;
	}

	input {
		background: transparent;
		border: none;
		color: currentColor;
		font-family: var(--sk-font-ui);
		flex: 1;
		margin: 0 0.2em 0 0rem;
		padding: 0.2rem;
		font-size: var(--sk-font-size-ui-medium);
	}

	button span {
		display: none;
	}

	.badge {
		background: #ff3e00;
		border-radius: 100%;
		font-size: 10px;
		padding: 0;
		width: 15px;
		height: 15px;
		line-height: 15px;
		position: absolute;
		top: 10px;
		right: 0px;
	}

	@media (min-width: 600px) {
		.icon[title^='fullscreen'] {
			display: inline;
		}

		button span {
			display: inline-block;
		}
	}
</style>
