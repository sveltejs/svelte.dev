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

	<section>
		<div class="identity">
			<span class="provider atproto" aria-hidden="true"></span>
			<h2>Atmosphere</h2>
			{#if atproto}
				<div class="session">
					<Avatar src={avatar_url(atproto)} name={display_name(atproto)} size="2.8rem" />
					<span class="who" title="@{atproto.handle}">
						<span class="name">{display_name(atproto)}</span>
						{#if display_name(atproto) !== atproto.handle}
							<span class="handle">@{atproto.handle}</span>
						{/if}
					</span>
					<button class="secondary" onclick={() => logout('atproto')}>Log out</button>
				</div>
			{:else}
				<button class="primary" onclick={() => login('atproto')}>Connect</button>
			{/if}
		</div>

		<p>Apps are stored on your Atproto Personal Data Server (PDS). Private apps require your PDS to implement <a href="https://atproto.com/blog/atproto-spaces-alpha">Spaces</a>, which are an alpha feature.</p>

		<ul class="checks">
			{@render check(!!atproto, 'Public apps')}
			{@render check(private_ready, !!atproto?.spaces_supported ? 'Private apps' : 'Private apps (not supported by your PDS)')}
		</ul>

		{#if !!atproto?.spaces_supported}
			<button class="secondary" onclick={enable_private_apps}>Enable private apps (experimental)</button>
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
	</section>

	<section>
		<div class="identity">
			<span class="provider github" aria-hidden="true"></span>
			<h2>GitHub</h2>
			{#if github}
				<div class="session">
					<Avatar src={avatar_url(github)} name={display_name(github)} size="2.8rem" />
					<span class="who" title={display_name(github)}>
						<span class="name">{display_name(github)}</span>
					</span>
					<button class="secondary" onclick={() => logout('github')}>Log out</button>
				</div>
			{:else}
				<button class="primary" onclick={() => login('github')}>Connect</button>
			{/if}
		</div>

		<ul class="checks">
			{@render check(!!github, 'Connected')}
		</ul>
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
		margin: 4rem 0 6rem 0;
	}

	.identity {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		/* the button is the tallest thing here: the row is the same logged in or out */
		min-height: 3.6rem;
		/* border-bottom: 1px solid rgba(128, 128, 128, 0.15); */
		/* padding: 0 0 2rem 0; */
		margin: 0 0 2rem 0;

		h2 {
			flex-shrink: 0;
			font: var(--sk-font-h3);
			margin: 0 auto 0 0;
		}

		.session {
			display: flex;
			align-items: center;
			gap: 1rem;
			min-width: 0;
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
			font-size: 1.2rem;
			line-height: 1.2;
		}

		button {
			flex-shrink: 0;
		}

		/* on narrow screens the session drops to its own row, name on the left */
		@media (max-width: 540px) {
			.session {
				flex-basis: 100%;
			}

			.who {
				flex: 1;
				text-align: left;
			}
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

	.checks {
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
