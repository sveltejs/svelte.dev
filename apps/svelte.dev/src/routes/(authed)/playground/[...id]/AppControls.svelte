<script lang="ts">
	import { page } from '$app/state';
	import UserMenu from '../../UserMenu.svelte';
	import { Icon } from '@sveltejs/site-kit/components';
	import { isMac } from '#lib/utils/compat.js';
	import { get_app_context } from '../../app-context';
	import type { Accounts, Gist } from '#lib/db/types.d.ts';
	import { account_for, home_of, type Destination } from '#lib/destination.js';
	import * as apps from '#lib/apps.js';
	import { browser } from '$app/env';
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
		examples,
		forked,
		saved
	}: Props = $props();

	const { login } = get_app_context();

	let saving = $state(false);
	let justSaved = $state(false);
	let justForked = $state(false);
	let select: ReturnType<typeof ModalDropdown>;

	function wait(ms: number) {
		return new Promise((f) => setTimeout(f, ms));
	}

	const logged_in = $derived(!!(accounts.github || accounts.atproto));
	const home = $derived(home_of(gist));
	const owner = $derived(account_for(home, accounts));
	const is_mine = $derived(!!owner && gist.owner === owner.id);
	// save writes in place only when the app already lives at the default; otherwise it copies there
	const canSave = $derived(is_mine && home === destination);

	function payload(files: File[], tailwind?: boolean) {
		const version = page.url.searchParams.get('version');
		return {
			name,
			tailwind: tailwind ?? false,
			svelte_version: version && version !== 'latest' ? version : undefined,
			files: files.map((file) => ({ name: file.name, type: '', source: file.contents }))
		};
	}

	const reauth = () => login('atproto');

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 's' && (isMac ? event.metaKey : event.ctrlKey)) {
			event.preventDefault();
			save();
		}
	}

	async function fork(intentWasSave: boolean) {
		saving = true;

		const { files, tailwind } = repl.toJSON() as { files: File[]; tailwind?: boolean };

		try {
			if (!destination) throw new Error('Pick where to save your apps in Accounts');
			const gist = await apps.with_reauth(
				() => apps.create(payload(files, tailwind), destination, accounts),
				reauth
			);
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

		if (!canSave) {
			fork(true);
			return;
		}

		saving = true;

		try {
			// Send all files back to API
			// ~> Any missing files are considered deleted!
			const { files, tailwind } = repl.toJSON() as { files: File[]; tailwind?: boolean };

			await apps.with_reauth(
				() => apps.update(gist.id, payload(files, tailwind), accounts),
				reauth
			);

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
			aria-label={logged_in
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

		{#if logged_in}
			<UserMenu {accounts} {destination} />
		{:else}
			<div class="raised login">
				<span>log in</span>
				<button
					class="icon atproto"
					onclick={() => login('atproto')}
					aria-label="log in with the Atmosphere"
				></button>
				<button class="icon github" onclick={() => login('github')} aria-label="log in with GitHub"
				></button>
			</div>
		{/if}
	</div>
</SecondaryNav>

<style>
	.buttons {
		display: flex;
		align-items: center;
		gap: 0.2rem;
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

	.login {
		display: flex;
		align-items: center;
		height: 3.2rem;
		padding: 0 0.1rem 0 0.4rem;
		font: 1.2rem / 1 var(--sk-font-family-ui);
		color: var(--sk-fg-3);

		span {
			margin-right: 0.3rem;
		}

		.icon {
			width: 2.6rem;
			height: 2.6rem;
			border-radius: var(--sk-border-radius-inner);

			&::before {
				content: '';
				display: block;
				width: 1.5rem;
				height: 1.5rem;
				margin: 0 auto;
				background: currentColor;
				mask: url(icons/at-sign) no-repeat 50% 50% / contain;
			}

			&.github::before {
				mask-image: url(icons/github);
			}

			&:hover {
				background: var(--sk-bg-4);
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
