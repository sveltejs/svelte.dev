<script lang="ts">
	import { get_app_context } from '../app-context.js';
	import { avatar_url, display_name } from '#lib/user.js';
	import Avatar from '#lib/components/Avatar.svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const { login, logout, enable_private_apps, disable_private_apps } = get_app_context();

	let { github, atproto } = $derived(data.accounts);
	const logged_in = $derived(!!(github || atproto));
	const private_ready = $derived(!!atproto?.spaces_supported && !!atproto.private_apps);
</script>

<svelte:head>
	<title>Accounts • Svelte</title>
</svelte:head>

{#snippet state(done: boolean)}
	<span class="mark" aria-hidden="true"></span>
	<span class="visually-hidden">{done ? 'done:' : 'to do:'}</span>
{/snippet}

{#snippet check(done: boolean, label: string)}
	<li class:done>
		{@render state(done)}
		{label}
	</li>
{/snippet}

<div class="accounts">
	<header>
		<h1>Accounts</h1>
		{#if logged_in}
			<a class="crosslink" href="/apps">Your apps</a>
		{/if}
	</header>

	<section data-active={!!atproto}>
		{#if atproto}
			<div class="controls">
				<a class="session" href={resolve('/(authed)/apps/[handle]', { handle: atproto.handle })}>
					<Avatar src={avatar_url(atproto)} name={display_name(atproto)} size="3.6rem" />
					<span class="who">
						<span>{display_name(atproto)}</span>

						{#if display_name(atproto) !== atproto.handle}
							<span class="handle">(@{atproto.handle})</span>
						{/if}
					</span>
				</a>

				<button class="raised" onclick={() => logout('atproto')}>Log out</button>
			</div>

			<ul class="checks">
				{@render check(!!atproto, 'public apps')}
				{@render check(private_ready, !!atproto?.spaces_supported ? 'private apps' : 'private apps (not supported by your PDS)')}
			</ul>

			{#if !!atproto?.spaces_supported}
				<button class="raised" onclick={enable_private_apps}>Enable private apps (experimental)</button>
			{:else if private_ready}
				<button
					class="danger"
					onclick={() => {
						if (confirm('Delete your space and every private app in it?')) disable_private_apps();
					}}
				>
					Delete private app space
				</button>
			{/if}
		{:else}
			<p>Logging in with an <a href="https://atmosphereaccount.com/">atmosphere account</a> allows you to store apps on your Personal Data Server (PDS).</p>
			<button class="raised" onclick={() => login('atproto')}>
				<span class="provider atproto" aria-hidden="true"></span>
				Log in with your atmosphere account
			</button>
		{/if}
	</section>

	<section data-active={!!github}>
		{#if github}
			<div class="controls">
				<a class="session" href="https://github.com/{github.github_login}">
					<Avatar src={avatar_url(github)} name={display_name(github)} size="3.6rem" />
					<span class="who">
						<span>{display_name(github)}</span>
						<span class="handle">(github.com/{github.github_login})</span>
					</span>
				</a>

				<button class="raised" onclick={() => logout('github')}>Log out</button>
			</div>
		{:else}
			<button class="raised" onclick={() => login('github')}>
				<span class="provider github" aria-hidden="true"></span>
				Log in with your GitHub account
			</button>
		{/if}
	</section>
</div>

<style>
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.accounts {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		margin: 0 auto;
		font: var(--sk-font-ui-medium);
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 2.4rem;
	}

	.crosslink {
		font: var(--sk-font-ui-medium);
		color: var(--sk-fg-3);
		text-decoration: none;

		&:hover {
			color: var(--sk-fg-accent);
		}
	}

	h1 {
		font: var(--sk-font-h1);
		text-wrap: balance;
	}

	section {
		margin: 0 0 1rem 0;

		&[data-active="true"] {
			margin: 0 0 4rem 0;
		}

		.controls {
			display: flex;
			justify-content: space-between;
		}
	}

	.session {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
		color: inherit;
		text-decoration: none;

		/* long handles shrink and ellipsize, never wrap the row */
		.who {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.handle {
			color: var(--sk-fg-3);
			font: var(--sk-font-ui-small);
		}
	}

	.provider {
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		background: currentColor;
		color: var(--sk-fg-3);
		mask: url(icons/at-sign) no-repeat 50% 50% / contain;

		&.atproto {
			mask-image: url(icons/at-sign);
		}

		&.github {
			mask-image: url(icons/github);
		}
	}

	.checks {
		padding: 0 0 0 4.6rem;
		margin: 1rem 0 0 0;

		li {
			font: var(--sk-font-ui-medium);
			display: flex;
			align-items: center;
			gap: 1rem;
			min-height: 3.2rem;
			color: var(--sk-fg-4);

			&.done {
				color: var(--sk-fg-2);
			}

			&.done .mark {
				background: var(--sk-fg-accent);
				border-color: var(--sk-fg-accent);
			}

			&.done .mark::after {
				opacity: 1;
				scale: 1;
			}
		}

		.mark {
			position: relative;
			width: 1.8rem;
			height: 1.8rem;
			flex-shrink: 0;
			border: 1.5px solid rgba(128, 128, 128, 0.4);
			border-radius: 50%;
			transition:
				background-color 150ms ease-out,
				border-color 150ms ease-out;

			&::after {
				content: '';
				position: absolute;
				inset: 0;
				background: white;
				mask: url(icons/check) no-repeat 50% 50% / 1.2rem;
				opacity: 0;
				scale: 0.25;
				transition:
					opacity 200ms cubic-bezier(0.2, 0, 0, 1),
					scale 200ms cubic-bezier(0.2, 0, 0, 1);
			}
		}
	}

	button {
		position: relative;
		height: 3.6rem;
		padding: 0 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		font: var(--sk-font-ui-small);
		white-space: nowrap;

		/* 40px hit area on a 36px control */
		&::before {
			content: '';
			position: absolute;
			inset: -0.2rem;
		}
	}

	.danger {
		color: var(--sk-fg-4);
		padding: 0;

		&:hover {
			color: #da106e;
		}
	}
</style>
