<script lang="ts">
	import { page } from '$app/state';
	import UserMenu from '../../UserMenu.svelte';
	import { Dropdown, HoverMenu, Icon } from '@sveltejs/site-kit/components';
	import { isMac } from '#lib/utils/compat.js';
	import { login } from '../../auth';
	import type { Accounts, Gist } from '#lib/db/types.d.ts';
	import {
		DESTINATIONS,
		home_of,
		is_owner,
		provider_of,
		type Destination
	} from '#lib/destination.js';
	import * as api from '#lib/apps.js';
	import ModalDropdown from '#lib/components/ModalDropdown.svelte';
	import SecondaryNav from '#lib/components/SecondaryNav.svelte';
	import type { File } from '@sveltejs/repl/workspace';
	import type { Repl } from '@sveltejs/repl';

	interface Props {
		examples: Array<{ title: string; examples: any[] }>;
		accounts: Accounts;
		destination: Destination | null;
		repl: ReturnType<typeof Repl>;
		gist: Gist;
		/** the version the REPL runs: URL param, else the app's pin, else `latest` */
		version: string;
		name: string;
		modified: boolean;
		forked: (value: { gist: Gist }) => void;
		saved: () => void;
	}

	let {
		name = $bindable(),
		modified = $bindable(),
		accounts,
		destination,
		repl,
		gist,
		version,
		examples,
		forked,
		saved
	}: Props = $props();

	let saving = $state(false);
	let justSaved = $state(false);
	let justForked = $state(false);
	let select: ReturnType<typeof ModalDropdown>;

	function wait(ms: number) {
		return new Promise((f) => setTimeout(f, ms));
	}

	const logged_in = $derived(!!(accounts.github || accounts.atproto));
	const home = $derived(home_of(gist));
	// your own app saves where it lives; anything else is a copy to the default destination
	const is_mine = $derived(is_owner(accounts, gist));
	const target = $derived(DESTINATIONS.find((d) => d.id === destination));
	const save_key = `${isMac ? '⌘' : 'Ctrl'}+S`;
	const save_label = $derived(
		!logged_in
			? 'log in to save'
			: is_mine
				? `save (${save_key})`
				: `save a copy to ${target?.label ?? 'your account'} (${save_key})`
	);

	// all files are sent: a missing one is deleted
	function payload(forked_from?: string) {
		const { files, tailwind, async } = repl.toJSON() as {
			files: File[];
			tailwind?: boolean;
			async?: boolean;
		};
		return {
			name,
			tailwind: tailwind ?? false,
			async,
			svelte_version: version !== 'latest' ? version : undefined,
			forked_from,
			files: files.map((file) => ({ name: file.name, type: '', source: file.contents }))
		};
	}

	// a 401 means the session behind the app's home (save) or the default (fork) is gone
	const reauth = (d: Destination | null) => () =>
		login(provider_of(d ?? home), accounts.atproto?.handle);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 's' && (isMac ? event.metaKey : event.ctrlKey)) {
			event.preventDefault();
			save();
		}
	}

	async function fork(intentWasSave: boolean) {
		saving = true;

		const app = payload(api.fork_source(gist));

		try {
			if (!destination) throw new Error('Pick where to save your apps on the apps page');
			const gist = await api.with_reauth(() => api.create(app, destination), reauth(destination));
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
		if (!logged_in) {
			alert('Please log in before saving your app');
			return;
		}
		if (saving) return;

		if (!is_mine) {
			fork(true);
			return;
		}

		saving = true;

		try {
			await api.with_reauth(() => api.update(gist.id, payload()), reauth(home));

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
</script>

<svelte:window on:keydown={handleKeydown} />

<SecondaryNav>
	<ModalDropdown label="Examples">
		<div class="secondary-nav-dropdown">
			<a class="create-new" href="/playground/untitled">Create new</a>

			{#each examples as section}
				<details>
					<summary>{section.title}</summary>

					<ul>
						{#each section.examples as example}
							<li>
								<a
									href="/playground/{example.slug}"
									aria-current={page.params.id === example.slug && !modified ? 'page' : undefined}
								>
									{example.title}
								</a>
							</li>
						{/each}
					</ul>
				</details>
			{/each}
		</div>

		<!-- <option value="untitled">Create new</option>
		<option disabled selected value="">or choose an example</option>
		{#each examples as section}
			<optgroup label={section.title}>
				{#each section.examples as example}
					<option value={example.slug}>{example.title}</option>
				{/each}
			</optgroup>
		{/each} -->
	</ModalDropdown>

	{#if gist.owner_handle && !is_mine}
		<a class="owner" href="/apps/{gist.owner_handle}" title="apps by @{gist.owner_handle}">
			@{gist.owner_handle}
		</a>
	{/if}

	<input
		bind:value={name}
		oninput={() => (modified = true)}
		onfocus={(e) => e.currentTarget.select()}
		onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
	/>

	<div class="buttons">
		<button
			class="raised icon tooltip"
			disabled={saving || !logged_in}
			onclick={() => fork(false)}
			aria-label={logged_in ? 'fork' : 'log in to fork'}
		>
			{#if justForked}
				<Icon size={18} name="check" />
			{:else}
				<Icon size={18} name="git-branch" />
			{/if}
		</button>

		<button
			class="raised icon tooltip"
			disabled={saving || !logged_in}
			onclick={save}
			aria-label={save_label}
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

		{#if logged_in}
			<UserMenu {accounts} {destination} />
		{:else}
			<Dropdown align="right">
				<span class="login">log in</span>
				<Icon size={18} name="chevron-down" />

				{#snippet dropdown()}
					<HoverMenu>
						<button onclick={() => login('atproto')}>Log in with the Atmosphere</button>
						<button onclick={() => login('github')}>Log in with GitHub</button>
					</HoverMenu>
				{/snippet}
			</Dropdown>
		{/if}
	</div>
</SecondaryNav>

<style>
	.buttons {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font: var(--sk-font-ui-medium);

		.login {
			padding: 0em 0 0 0.4rem;
		}
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
	}

	.icon {
		position: relative;
		color: var(--sk-fg-3);
		line-height: 1;
		background-size: 1.8rem;
		z-index: 999;
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}

	/* TODO use lucide-svelte, so we don't need all this customisation? */
	.icon:disabled {
		color: #ccc;

		:root:not(.light) & {
			@media (prefers-color-scheme: dark) {
				color: #555;
			}
		}

		:root.dark & {
			color: #555;
		}
	}

	input {
		background: transparent;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		color: currentColor;
		width: 0;
		flex: 1;
		padding: 0.2rem 0.6rem;
		height: 3.2rem;
		font: var(--sk-font-ui-medium);
	}

	.owner {
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-3);
		max-width: 14rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-decoration: none;

		&:hover {
			color: var(--sk-fg-accent);
		}
	}

	.badge {
		position: absolute;
		background: var(--sk-fg-accent);
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
		top: -0.2rem;
		right: -0.2rem;
	}

	.create-new {
		margin-bottom: 1rem;
	}
</style>
