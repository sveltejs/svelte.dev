<script lang="ts">
	import { get_app_context } from '../app-context.js';
	import { avatar_url, display_name } from '#lib/user.js';
	import Avatar from '#lib/components/Avatar.svelte';

	let { data } = $props();

	const { login, logout, enable_private_apps, disable_private_apps } = get_app_context();

	const { github, atproto } = $derived(data.accounts);
	const logged_in = $derived(!!(github || atproto));
	const private_ready = $derived(!!atproto?.spaces_supported && !!atproto.private_apps);
</script>

<svelte:head>
	<title>Accounts • Svelte</title>
</svelte:head>

{#snippet check(done: boolean, label: string, hint?: string)}
	<li class:done>
		<span class="mark" aria-hidden="true"></span>
		<span class="label">
			{label}
			{#if hint}<span class="hint">{hint}</span>{/if}
		</span>
	</li>
{/snippet}

{#snippet group(title: string, ready: boolean, hint?: string)}
	<h3>
		{title}
		<span class="pill" class:ready>{ready ? 'ready' : 'not ready'}</span>
		{#if hint}<span class="hint">{hint}</span>{/if}
	</h3>
{/snippet}

<div class="accounts">
	<header>
		<h1>Accounts</h1>
		{#if logged_in}
			<a class="crosslink" href="/apps">Your apps</a>
		{/if}
	</header>

	<section class="card" class:connected={!!atproto}>
		<div class="identity">
			<span class="provider atproto" aria-hidden="true"></span>
			<h2>Atmosphere</h2>
			{#if atproto}
				<Avatar src={avatar_url(atproto)} name={display_name(atproto)} size="2.8rem" />
				<span class="who" title="@{atproto.handle}">
					<span class="name">{display_name(atproto)}</span>
					{#if display_name(atproto) !== atproto.handle}
						<span class="handle">@{atproto.handle}</span>
					{/if}
				</span>
				<button class="secondary" onclick={() => logout('atproto')}>Log out</button>
			{:else}
				<button class="primary" onclick={() => login('atproto')}>Connect</button>
			{/if}
		</div>

		{@render group('Public apps', !!atproto, 'records on your PDS, anyone can open them')}
		<ul class="checks">
			{@render check(!!atproto, 'Connected')}
		</ul>

		{@render group(
			'Private apps',
			private_ready,
			'alpha: in a space on your PDS, only you can open them'
		)}
		<ul class="checks">
			{@render check(!!atproto, 'Connected')}
			{@render check(
				!!atproto?.spaces_supported,
				'PDS supports spaces',
				atproto && !atproto.spaces_supported ? 'not yet, spaces are an atproto alpha' : undefined
			)}
			<li class:done={private_ready}>
				<span class="mark" aria-hidden="true"></span>
				<span class="label">Space enabled</span>
				{#if atproto?.spaces_supported && !atproto.private_apps}
					<button class="secondary" onclick={enable_private_apps}>Enable</button>
				{:else if private_ready}
					<button
						class="danger"
						onclick={() => {
							if (confirm('Delete your space and every private app in it?')) disable_private_apps();
						}}
					>
						Delete space
					</button>
				{/if}
			</li>
		</ul>

		{#if data.renew_atproto}
			<p class="renew">
				Your login is about to expire.
				<button class="secondary" onclick={() => login('atproto')}>Renew now</button>
			</p>
		{/if}
	</section>

	<section class="card" class:connected={!!github}>
		<div class="identity">
			<span class="provider github" aria-hidden="true"></span>
			<h2>GitHub</h2>
			{#if github}
				<Avatar src={avatar_url(github)} name={display_name(github)} size="2.8rem" />
				<span class="who" title={display_name(github)}>
					<span class="name">{display_name(github)}</span>
				</span>
				<button class="secondary" onclick={() => logout('github')}>Log out</button>
			{:else}
				<button class="primary" onclick={() => login('github')}>Connect</button>
			{/if}
		</div>

		{@render group('Apps', !!github, 'stored on svelte.dev')}
		<ul class="checks">
			{@render check(!!github, 'Connected')}
		</ul>
	</section>
</div>

<style>
	.accounts {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-content-width);
		margin: 0 auto;
		font: var(--sk-font-ui-medium);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2.4rem;

		.crosslink {
			font: var(--sk-font-ui-medium);
			color: var(--sk-fg-3);
			text-decoration: none;

			&:hover {
				color: var(--sk-fg-accent);
			}
		}
	}

	h1 {
		font: var(--sk-font-h1);
		text-wrap: balance;
	}

	.card {
		padding: 2rem;
		margin-bottom: 1.6rem;
		border-radius: var(--sk-border-radius);
		background: var(--sk-bg-2);
		box-shadow:
			0 0 0 1px rgba(128, 128, 128, 0.12),
			0 1px 2px rgba(0, 0, 0, 0.04),
			0 8px 24px -12px rgba(0, 0, 0, 0.12);
	}

	.identity {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-height: 2.8rem;

		h2 {
			flex-shrink: 0;
			font: var(--sk-font-h3);
			margin: 0 auto 0 0;
		}

		/* long handles shrink and ellipsize, never wrap the row */
		.who {
			display: flex;
			flex-direction: column;
			min-width: 0;
			line-height: 1.2;
			text-align: right;

			.name,
			.handle {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.handle {
			color: var(--sk-fg-3);
			font: var(--sk-font-ui-small);
		}

		button {
			flex-shrink: 0;
		}
	}

	.provider {
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		background: currentColor;
		color: var(--sk-fg-3);
		mask: url(icons/at-sign) no-repeat 50% 50% / contain;

		&.github {
			mask-image: url(icons/github);
		}
	}

	.connected .provider {
		color: var(--sk-fg-1);
	}

	h3 {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.8rem;
		margin: 2rem 0 0.6rem 0;
		padding-top: 1.6rem;
		border-top: 1px solid rgba(128, 128, 128, 0.15);
		font: var(--sk-font-ui-medium);
		font-weight: 600;
		color: var(--sk-fg-2);

		.hint {
			flex-basis: 100%;
			font: var(--sk-font-ui-small);
			font-weight: normal;
			color: var(--sk-fg-4);
		}
	}

	.pill {
		padding: 0.2rem 0.7rem;
		border-radius: 1rem;
		background: var(--sk-bg-4);
		color: var(--sk-fg-4);
		font: 1.1rem / 1.4 var(--sk-font-family-ui);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		transition:
			background-color 150ms ease-out,
			color 150ms ease-out;

		&.ready {
			background: var(--sk-fg-accent);
			color: white;
		}
	}

	.checks {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;

		li {
			display: flex;
			align-items: center;
			gap: 1rem;
			min-height: 2.4rem;
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

		.label {
			display: flex;
			flex-wrap: wrap;
			column-gap: 0.6rem;
			align-items: baseline;
			margin-right: auto;
		}

		.hint {
			color: var(--sk-fg-4);
			font: var(--sk-font-ui-small);
		}
	}

	.renew {
		margin: 1.6rem 0 0 0;
		color: var(--sk-fg-3);
	}

	button {
		position: relative;
		height: 3.6rem;
		padding: 0 1.4rem;
		border-radius: var(--sk-border-radius);
		font: var(--sk-font-ui-small);
		white-space: nowrap;
		transition:
			background-color 150ms ease-out,
			color 150ms ease-out,
			scale 100ms ease-out;

		&:active {
			scale: 0.96;
		}

		/* 40px hit area on a 36px control */
		&::before {
			content: '';
			position: absolute;
			inset: -0.2rem;
		}
	}

	.primary {
		background: var(--sk-bg-accent);
		color: white;
	}

	.secondary {
		background: var(--sk-bg-4);
		color: var(--sk-fg-2);

		&:hover {
			background: var(--sk-fg-4);
			color: var(--sk-bg-1);
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
