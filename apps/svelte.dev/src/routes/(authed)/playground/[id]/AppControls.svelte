<script lang="ts">
	import { page } from '$app/state';
	import UserMenu from './UserMenu.svelte';
	import { Icon } from '@sveltejs/site-kit/components';
	import { isMac } from '$lib/utils/compat.js';
	import { get_app_context } from '../../app-context';
	import type { Gist, User } from '$lib/db/types';
	import { browser } from '$app/environment';
	import ModalDropdown from '$lib/components/ModalDropdown.svelte';
	import SecondaryNav from '$lib/components/SecondaryNav.svelte';
	import type { File } from '@sveltejs/repl/workspace';
	import type { Repl } from '@sveltejs/repl';

	interface Props {
		examples: Array<{ title: string; examples: any[] }>;
		user: User | null;
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
		user,
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
						name: file.name,
						source: file.contents
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
						name: file.name,
						source: file.contents
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

	<input
		bind:value={name}
		oninput={() => (modified = true)}
		onfocus={(e) => e.currentTarget.select()}
		onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
	/>

	<div class="buttons">
		<button
			class="raised icon tooltip"
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
			class="raised icon tooltip"
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

		{#if user}
			<UserMenu {user} />
		{:else}
			<button class="raised icon login" onclick={login}>
				<span>log in</span>
			</button>
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

		&.login {
			width: auto;
			padding: 0 0.4rem;

			&::before {
				content: '';
				width: 1.8rem;
				height: 1.8rem;
				margin: 0 0.5rem 0 0;
				background: currentColor;
				mask: url(icons/user) no-repeat 50% 50%;
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
