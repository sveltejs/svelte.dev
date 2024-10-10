<script lang="ts">
	import { goto } from '$app/navigation';
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
	import { browser } from '$app/environment';

	interface Props {
		examples: Array<{ title: string; examples: any[] }>;
		user: User | null;
		repl: Repl;
		gist: Gist;
		name: string;
		modified: boolean;
		forked: (value: { gist: Gist }) => void;
		saved: () => void;
	}

	let {
		name = $bindable(),
		modified = $bindable(),
		user,
		repl,
		gist,
		examples,
		forked,
		saved
	}: Props = $props();

	const { login } = get_app_context();

	let saving = $state(false);
	let downloading = $state(false);
	let justSaved = $state(false);
	let justForked = $state(false);
	let select: HTMLSelectElement;

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

			modified = false;
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

			modified = false;
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

	// modifying an app should reset the `<select>`, so that
	// the example can be reselected
	$effect(() => {
		if (modified) {
			select.value = '';
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app-controls">
	<div class="examples-select">
		<span class="raised icon"><Icon name="menu" /></span>
		<select
			bind:this={select}
			title="examples"
			value={gist.id}
			onchange={(e) => {
				goto(`/playground/${e.currentTarget.value}`);
			}}
		>
			<option value="untitled">Create new</option>
			<option disabled selected value="">or choose an example</option>
			{#each examples as section}
				<optgroup label={section.title}>
					{#each section.examples as example}
						<option value={example.slug}>{example.title}</option>
					{/each}
				</optgroup>
			{/each}
		</select>
	</div>

	<input
		bind:value={name}
		onchange={() => (modified = true)}
		onfocus={(e) => e.currentTarget.select()}
		use:enter={(e) => (e.currentTarget as HTMLInputElement).blur()}
	/>

	<div class="buttons">
		<button
			class="raised icon"
			disabled={saving || !user}
			onclick={() => fork(false)}
			aria-label={user ? 'fork' : 'log in to fork'}
		>
			{#if justForked}
				<Icon size={18} name="check" />
			{:else}
				<Icon size={18} name="git-branch" />
			{/if}
		</button>

		<button
			class="raised icon"
			disabled={saving || !user}
			onclick={save}
			aria-label={user
				? `save (${browser && navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}+S)`
				: 'log in to save'}
		>
			{#if justSaved}
				<Icon size={18} name="check" />
			{:else}
				<Icon size={18} name="save" />
				{#if modified}
					<span class="badge"></span>
				{/if}
			{/if}
		</button>

		<button
			class="raised icon download"
			disabled={downloading}
			onclick={download}
			aria-label="download zip file"
		></button>

		{#if user}
			<UserMenu {user} />
		{:else}
			<button class="raised icon login" onclick={login}>
				<span>log in</span>
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
		gap: 1rem;

		@media (min-width: 800px) {
			padding-top: 1rem;
		}
	}

	.buttons {
		text-align: right;
		display: flex;
		align-items: center;
		gap: 0.2em;
	}

	.examples-select {
		position: relative;

		&:has(select:focus-visible) .raised.icon {
			outline: 2px solid hsla(var(--sk-theme-1-hsl), 0.6);
			border-radius: var(--sk-border-radius);
		}

		span {
			pointer-events: none;
		}
	}

	select {
		opacity: 0.0001;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		font-family: var(--sk-font-ui);
	}

	button,
	span.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.2rem;
		height: 3.2rem;
		user-select: none;
	}

	.icon {
		position: relative;
		font-family: var(--sk-font-ui);
		font-size: var(--sk-font-size-ui-small);
		color: var(--sk-text-3);
		line-height: 1;
		background: 50% 50% no-repeat;
		background-size: 1.8rem;
		z-index: 999;

		&[aria-label]:hover::before {
			content: '';
			width: 1rem;
			height: 1rem;
			position: absolute;
			background: var(--sk-text-3);
			top: calc(100% + 0.5rem);
			rotate: 45deg;
		}

		&[aria-label]:hover::after {
			content: attr(aria-label);
			position: absolute;
			top: calc(100% + 1rem);
			background: var(--sk-text-3);
			color: var(--sk-back-4);
			padding: 0.5em 0.5em;
			border-radius: var(--sk-border-radius);
		}

		&.login {
			width: auto;
			background-image: url($lib/icons/user-light.svg);
			background-position: 0.4rem 50%;
			padding: 0 0.4rem 0 2.8rem;

			:root.dark & {
				background-image: url($lib/icons/user-dark.svg);
			}
		}

		&.download {
			background-image: url($lib/icons/download-light.svg);

			:root.dark & {
				background-image: url($lib/icons/download-dark.svg);
			}
		}
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}

	/* TODO use lucide-svelte, so we don't need all this customisation? */
	.icon:disabled {
		color: #ccc;

		:root.dark & {
			color: #555;
		}
	}

	input {
		background: transparent;
		border: 1px solid var(--sk-back-4);
		border-radius: var(--sk-border-radius);
		color: currentColor;
		font-family: var(--sk-font-ui);
		width: 0;
		flex: 1;
		padding: 0.2rem 0.6rem;
		height: 3.2rem;
		font-size: var(--sk-font-size-ui-medium);
	}

	.badge {
		position: absolute;
		background: var(--sk-theme-1);
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
		top: -0.2rem;
		right: -0.2rem;
	}
</style>
