<script lang="ts">
	import { Icon } from '@sveltejs/site-kit/components';
	import { ago } from '$lib/time';
	import { goto, invalidateAll } from '$app/navigation';
	import { get_app_context } from '../app-context.js';

	let { data } = $props();

	const { login, logout } = get_app_context();

	const format = (str: string) => ago(new Date(str));

	let destroying = $state(false);
	let selected: string[] = $state([]);
	const selecting = $derived(selected.length > 0);

	async function destroy_selected() {
		const confirmed = confirm(
			`Are you sure you want to delete ${selected.length} ${
				selected.length === 1 ? 'app' : 'apps'
			}?`
		);
		if (!confirmed) return;

		destroying = true;

		const res = await fetch(`/apps/destroy`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				ids: selected
			})
		});

		if (res.ok) {
			selected = [];
			await invalidateAll();

			// this is a temporary fix because invalidation only works once
			// TODO raise an issue
			// location.reload();
		} else {
			alert('Deletion failed');
		}

		destroying = false;
	}
</script>

<svelte:head>
	<title>Your apps • Svelte</title>
</svelte:head>

<div class="apps">
	{#if data.user}
		<header>
			<h1>Your apps</h1>
			<div class="user">
				<img
					class="avatar"
					alt="{data.user.github_name || data.user.github_login} avatar"
					src={data.user.github_avatar_url}
				/>
				<span>
					{data.user.github_name || data.user.github_login}
					(<a onclick={(e) => (e.preventDefault(), logout())} href="/auth/logout">log out</a>)
				</span>
			</div>
		</header>

		<div class="controls">
			{#if selected.length > 0}
				<button class="delete" onclick={destroy_selected} disabled={destroying}>
					<Icon name="delete" />
					Delete {selected.length}
					{selected.length === 1 ? 'app' : 'apps'}
				</button>

				<button onclick={() => (selected = [])}>Clear selection</button>
			{:else}
				<form
					onsubmit={(e) => {
						e.preventDefault();
						const search = new FormData(e.target as HTMLFormElement).get('search');
						goto(search ? `/apps?search=${encodeURIComponent(search.toString())}` : '/apps');
					}}
				>
					<input
						type="search"
						placeholder="Search"
						aria-label="Search"
						name="search"
						value={data.search}
					/>
				</form>
			{/if}
		</div>

		{#if data.gists.length > 0}
			<ul class:selecting>
				{#each data.gists as gist}
					<li class:selected={selected.includes(gist.id)}>
						<a href={selecting ? undefined : `/playground/${gist.id}`}>
							<h2>{gist.name}</h2>
							<span>updated {format(gist.updated_at || gist.created_at)}</span>
						</a>

						<label>
							<input
								aria-label="Select for delection"
								type="checkbox"
								bind:group={selected}
								value={gist.id}
							/>
						</label>
					</li>
				{/each}
			</ul>

			<div class="pagination">
				<!-- TODO more sophisticated pagination -->
				{#if data.next !== null && !selecting}
					<a
						href="/apps?offset={data.next}{data.search
							? `&search=${encodeURIComponent(data.search)}`
							: ''}">Next page...</a
					>
				{/if}
			</div>
		{:else}
			<p>No apps here. <a href="/playground">Go make one!</a></p>
		{/if}
	{:else}
		<p>
			Please <a onclick={(e) => (e.preventDefault(), login())} href="/auth/login">log in</a> to see your
			saved apps.
		</p>
	{/if}
</div>

<style>
	.apps {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		margin: 0 auto;
	}

	h1 {
		font: var(--sk-font-h1);
	}

	.user {
		display: flex;
		padding: 0 0 0 3.2rem;
		position: relative;
		margin: 1rem 0;
		font: var(--sk-font-ui-medium);

		.avatar {
			position: absolute;
			left: 0;
			top: 0.1rem;
			width: 2.4rem;
			height: 2.4rem;
			border: 1px solid rgba(0, 0, 0, 0.3);
			border-radius: var(--sk-border-radius);
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
