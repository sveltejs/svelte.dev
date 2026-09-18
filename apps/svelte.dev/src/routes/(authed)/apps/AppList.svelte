<script lang="ts">
	import { Icon } from '@sveltejs/site-kit/components';
	import { ago } from '#lib/time.js';
	import { goto, invalidateAll } from '$app/navigation';
	import { get_app_context } from '../app-context.js';
	import { DESTINATIONS, available, provider_of, type Destination } from '#lib/destination.js';
	import Avatar from '#lib/components/Avatar.svelte';
	import type { Accounts } from '#lib/db/types.d.ts';
	import * as api from '#lib/apps.js';

	interface Owner {
		handle: string;
		display_name: string;
		avatar: string;
	}

	interface Props {
		accounts: Accounts;
		destination: Destination | null;
		/** null: your own apps */
		owner: Owner | null;
		apps: Array<{ id: string; name: string; updated_at?: string; created_at?: string }>;
		next: number | null;
		search: string | null;
		tab: Destination;
		counts?: Record<string, string>;
		/** the tab's records could not be read */
		error?: 'session' | 'unavailable' | null;
	}

	let {
		accounts,
		destination,
		owner,
		apps,
		next,
		search,
		tab,
		counts = {},
		error = null
	}: Props = $props();

	const LEADING_AT_REGEX = /^@/;

	const { login, set_destination } = get_app_context();

	const format = (str: string | undefined) => (str ? ago(new Date(str)) : 'recently');

	const base = $derived(owner ? `/apps/${owner.handle}` : '/apps');
	const logged_in = $derived(!!(accounts.github || accounts.atproto));
	const tab_available = $derived(available(tab, accounts));
	const tabs = $derived(DESTINATIONS.filter((d) => available(d.id, accounts)));
	// a single destination needs no tab UI, unless a link opened an unavailable one
	const show_tabs = $derived(tabs.length > 1 || !tab_available);

	let destroying = $state(false);
	let copying = $state(false);
	let selected: string[] = $state([]);
	const selecting = $derived(selected.length > 0);
	const copy_target = $derived(
		destination && destination !== tab ? DESTINATIONS.find((d) => d.id === destination) : null
	);

	async function copy_selected() {
		if (!destination) return;
		copying = true;

		try {
			await api.copy(selected, destination, () => login(provider_of(destination)));
			selected = [];
			await invalidateAll();
		} catch (e) {
			alert(`Copy failed: ${(e as Error).message}`);
		}

		copying = false;
	}

	function url(params: Record<string, string | null | undefined>) {
		const q = new URLSearchParams();
		for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
		const s = q.toString();
		return s ? `${base}?${s}` : base;
	}

	/** Someone else's apps live on one page: only your own list carries a tab. */
	function list_url(params: Record<string, string | null | undefined> = {}) {
		return url({ tab: owner ? null : tab, ...params });
	}

	async function destroy_selected() {
		const confirmed = confirm(
			`Are you sure you want to delete ${selected.length} ${
				selected.length === 1 ? 'app' : 'apps'
			}?`
		);
		if (!confirmed) return;

		destroying = true;

		try {
			// everything selected lives on the current tab
			await api.with_reauth(
				() => api.destroy(selected),
				() => login(provider_of(tab))
			);
			selected = [];
			await invalidateAll();
		} catch (e) {
			alert(`Deletion failed: ${(e as Error).message}`);
		}

		destroying = false;
	}
</script>

{#snippet browse()}
	<form
		class="browse"
		onsubmit={(e) => {
			e.preventDefault();
			const handle = new FormData(e.target as HTMLFormElement).get('handle')?.toString().trim();
			if (handle) goto(`/apps/${encodeURIComponent(handle.replace(LEADING_AT_REGEX, ''))}`);
		}}
	>
		<label for="browse-handle">Browse someone's public apps</label>
		<input
			id="browse-handle"
			name="handle"
			placeholder="your.atmosphere.handle"
			autocomplete="off"
			autocapitalize="none"
			autocorrect="off"
			spellcheck="false"
			inputmode="url"
		/>
		<button type="submit">Go</button>
	</form>
{/snippet}

{#snippet controls()}
	<div class="controls">
		{#if selected.length > 0}
			<button class="delete" onclick={destroy_selected} disabled={destroying}>
				<Icon name="delete" />
				Delete {selected.length}
				{selected.length === 1 ? 'app' : 'apps'}
			</button>

			{#if copy_target}
				<button class="copy" onclick={copy_selected} disabled={copying}>
					<Icon name="copy-to-clipboard-empty" />
					Copy {selected.length}
					{selected.length === 1 ? 'app' : 'apps'} to {copy_target.label}
				</button>
			{/if}

			<button class="clear" onclick={() => (selected = [])}>Clear selection</button>
		{:else}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					const search = new FormData(e.target as HTMLFormElement).get('search');
					goto(list_url({ search: search?.toString() }));
				}}
			>
				<input
					type="search"
					placeholder="Search"
					aria-label="Search"
					name="search"
					value={search}
					oninput={(e) => {
						// the native clear (x) button only fires input, not submit
						if (search && !e.currentTarget.value) goto(list_url());
					}}
				/>
			</form>
		{/if}
	</div>
{/snippet}

{#snippet list()}
	{#if error === 'session'}
		<p class="notice">
			Your Atmosphere session expired.
			<a onclick={(e) => (e.preventDefault(), login('atproto'))} href="/auth/login/atproto">
				Log in again
			</a>
			to see these apps.
		</p>
	{:else if error === 'unavailable'}
		<p class="notice">
			Could not reach your PDS.
			<a href={list_url({ search })}>Try again</a>.
		</p>
	{:else if apps.length > 0}
		<ul class:selecting>
			{#each apps as app (app.id)}
				<li class:selected={selected.includes(app.id)}>
					<a href={selecting ? undefined : `/playground/${app.id}`}>
						<h2>{app.name}</h2>
						<span>updated {format(app.updated_at || app.created_at)}</span>
					</a>

					{#if !owner}
						<label>
							<input
								aria-label="Select for deletion"
								type="checkbox"
								bind:group={selected}
								value={app.id}
							/>
						</label>
					{/if}
				</li>
			{/each}
		</ul>

		<div class="pagination">
			{#if next !== null && !selecting}
				<a href={list_url({ offset: String(next), search })}>Next page...</a>
			{/if}
		</div>
	{:else if search}
		<p>Nothing found for "{search}". <a href={list_url()}>Clear search</a></p>
	{:else if owner}
		<p>No public apps here.</p>
	{:else}
		<p>No apps here. <a href="/playground">Go make one!</a></p>
	{/if}
{/snippet}

<div class="apps">
	{#if owner}
		<header>
			<div class="owner">
				<Avatar src={owner.avatar} name={owner.display_name || owner.handle} size="3.2rem" />
				<h1>
					<span class="owner-name">{owner.display_name || owner.handle}</span><span>'s apps</span>
				</h1>
			</div>
			{#if logged_in}
				<a class="crosslink" href="/apps">Your apps</a>
			{/if}
		</header>

		{@render controls()}

		{@render list()}
	{:else if logged_in}
		<header>
			<h1>Your apps</h1>
			<a class="crosslink" href="/accounts">Accounts</a>
		</header>

		{@render controls()}

		{#if show_tabs}
			<nav class="tabs">
				{#each tabs as d (d.id)}
					<a href={url({ tab: d.id, search })} aria-current={tab === d.id ? 'page' : undefined}>
						{d.label}
						{#if counts[d.id] !== undefined}<span class="count">{counts[d.id]}</span>{/if}
					</a>
				{/each}

				{#if tab_available}
					<button
						class="default-toggle"
						class:active={tab === destination}
						disabled={tab === destination}
						onclick={() => set_destination(tab)}
						title={tab === destination
							? 'New apps are saved here'
							: 'Save new apps here by default'}
					>
						<Icon name="save" size={14} />
						{tab === destination ? 'default' : 'set as default'}
					</button>
				{/if}
			</nav>
		{/if}

		{#if tab_available}
			{@render list()}
		{:else if tab === 'atproto-private'}
			<p class="notice">
				Not set up yet. <a href="/accounts">Check the setup in Accounts</a>.
			</p>
		{:else}
			<p class="notice">
				<a
					onclick={(e) => (e.preventDefault(), login(tab === 'github' ? 'github' : 'atproto'))}
					href={tab === 'github' ? '/auth/login' : '/auth/login/atproto'}
				>
					Log in with {tab === 'github' ? 'GitHub' : 'the Atmosphere'}
				</a>
				to see these apps.
			</p>
		{/if}
	{:else}
		<p>
			Please log in with
			<a onclick={(e) => (e.preventDefault(), login('atproto'))} href="/auth/login/atproto"
				>the Atmosphere</a
			>
			or
			<a onclick={(e) => (e.preventDefault(), login('github'))} href="/auth/login">GitHub</a>
			to see your saved apps.
		</p>
	{/if}

	{#if !owner}
		{@render browse()}
	{/if}
</div>

<style>
	.apps {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 0 var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		margin: 0 auto;
	}

	h1 {
		font: var(--sk-font-h1);
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;

		.crosslink {
			flex-shrink: 0;
			font: var(--sk-font-ui-medium);
			color: var(--sk-fg-3);
			text-decoration: none;

			&:hover {
				color: var(--sk-fg-accent);
			}
		}

		h1 {
			display: flex;
			min-width: 0;
			white-space: nowrap;
		}

		.owner-name {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.owner-name + span {
			flex-shrink: 0;
		}

		.owner {
			display: flex;
			align-items: center;
			gap: 1rem;
			min-width: 0;
			flex: 1;
		}
	}

	.notice {
		margin-bottom: 2rem;
	}

	.tabs {
		display: flex;
		gap: 0.4rem;
		margin: 0 0 1.6rem 0;
		border-bottom: 1px solid var(--sk-border);
		font: var(--sk-font-ui-medium);

		a {
			padding: 0.8rem 1.2rem;
			color: var(--sk-fg-3);
			text-decoration: none;
			border-bottom: 2px solid transparent;
			margin-bottom: -1px;

			&[aria-current='page'] {
				color: var(--sk-fg-1);
				border-bottom-color: var(--sk-fg-accent);
			}

			.count {
				display: inline-block;
				min-width: 1.6rem;
				padding: 0.1rem 0.4rem;
				margin-left: 0.3rem;
				border-radius: 1rem;
				background: var(--sk-bg-3);
				color: var(--sk-fg-3);
				font: 1rem / 1.2 var(--sk-font-family-ui);
				font-variant-numeric: tabular-nums;
				text-align: center;
				vertical-align: 0.1rem;
			}

			&[aria-current='page'] .count {
				background: var(--sk-fg-accent);
				color: white;
			}
		}
	}

	.default-toggle {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-left: auto;
		padding: 0.8rem 0.4rem;
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-4);
		cursor: pointer;

		&:hover {
			color: var(--sk-fg-accent);
		}

		&.active {
			color: var(--sk-fg-accent);
			cursor: default;
		}
	}

	.browse {
		position: sticky;
		bottom: 0;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.8rem;
		margin: 6rem 0 0 0;
		padding: 1.2rem 0;
		border-top: 1px solid var(--sk-border);
		background: var(--sk-bg-1);
		font: var(--sk-font-ui-medium);
		z-index: 2;
		color: var(--sk-fg-3);

		input {
			flex: 1;
			min-width: 16rem;
			height: 3.2rem;
			padding: 0 1rem;
			border: 1px solid var(--sk-border);
			border-radius: var(--sk-border-radius);
			background: var(--sk-bg-1);
			color: inherit;
			font: inherit;
		}

		button {
			height: 3.2rem;
			padding: 0 1.2rem;
			border-radius: var(--sk-border-radius);
			background: var(--sk-bg-accent);
			color: white;
		}
	}

	.controls {
		position: sticky;
		top: 1rem;
		display: flex;
		align-items: center;
		width: 100%;
		height: 4rem;
		margin: 0 0 2rem 0;
		font: var(--sk-font-ui-medium);
		z-index: 2;
		justify-content: space-between;
		outline: 1rem solid var(--sk-bg-1);
	}

	.controls::after {
		content: '';
		position: absolute;
		width: 100%;
		bottom: -2rem;
		height: 2rem;
		background: linear-gradient(to bottom, var(--sk-bg-1) 0%, var(--sk-bg-1) 50%, transparent);
	}

	.controls form {
		width: 100%;
		height: 100%;
	}

	.controls input[type='search'] {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 0.5rem 1rem;
		line-height: 1;
		display: flex;
		border: 1px solid var(--sk-border);
		border-radius: var(--sk-border-radius);
		z-index: 2;
		font: var(--sk-font-ui-large);
	}

	.controls button {
		display: flex;
		gap: 1rem;
		padding: 0 1rem;
		height: 100%;
		border-radius: var(--sk-border-radius);
		align-items: center;
	}

	.delete {
		background-color: #da106e;
		color: white;
	}

	ul {
		list-style: none;
		display: grid;
		grid-gap: 1rem;
	}

	li {
		position: relative;
		overflow: hidden;
	}

	h2 {
		color: var(--sk-fg-2);
		font: var(--sk-font-ui-medium);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	li a {
		display: block;
		background: var(--sk-bg-3);
		padding: 1rem 3rem 1rem 1rem;
		height: 100%;
		line-height: 1;
		border-radius: var(--sk-border-radius);
		text-decoration: none;
	}

	li span {
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-3);
	}

	li label {
		position: absolute;
		right: 0;
		top: 0;
		padding: 1rem;
	}

	li input {
		display: block;
		opacity: 0.2;
	}

	ul:not(.selecting) li:hover a {
		background-color: var(--sk-bg-4);
	}

	ul:not(.selecting) li:hover input {
		opacity: 1;
	}

	li.selected {
		filter: drop-shadow(1px 2px 4px hsla(205.7, 63.6%, 30.8%, 0.1));
		transform: var(--safari-fix);
		-webkit-transform: var(--safari-fix);
	}

	li.selected input {
		opacity: 1;
	}

	.selecting li:not(.selected) {
		opacity: 0.4;
	}

	.selecting li:not(.selected):hover,
	.selecting li:not(.selected):focus-within {
		opacity: 1;
	}

	.pagination {
		height: 4rem;
	}

	@media (min-width: 540px) {
		ul {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 720px) {
		ul {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
