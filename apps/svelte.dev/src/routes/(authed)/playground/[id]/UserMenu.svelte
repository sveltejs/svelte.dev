<script lang="ts">
	import { Icon } from '@sveltejs/site-kit/components';
	import { click_outside, focus_outside } from '@sveltejs/site-kit/actions';
	import { get_app_context } from '../../app-context';
	import type { User } from '$lib/db/session';

	const { logout } = get_app_context();

	let { user }: { user: User } = $props();

	let showMenu = $state(false);
	let name = $derived(user.github_name ?? user.github_login);
</script>

<div
	class="user"
	use:focus_outside={() => (showMenu = false)}
	use:click_outside={() => (showMenu = false)}
>
	<button
		onclick={() => (showMenu = !showMenu)}
		aria-expanded={showMenu}
		class="trigger"
		aria-label={name}
	>
		<span class="name">{name}</span>
		<img alt="{name} avatar" src={user.github_avatar_url} />
		<Icon size={18} name={showMenu ? 'chevron-up' : 'chevron-down'} />
	</button>

	{#if showMenu}
		<div class="menu">
			<a href="/apps">Your saved apps</a>
			<button onclick={logout}>Log out</button>
		</div>
	{/if}
</div>

<style>
	.user {
		position: relative;
		display: inline-block;
		padding: 0em 0 0 0.4rem;
		z-index: 99;
	}

	.trigger {
		display: flex;
		align-items: center;
		outline-offset: 2px;
		transform: translateY(0.1rem);
		--opacity: 0.7;
	}

	.trigger:hover,
	.trigger:focus-visible,
	.trigger[aria-expanded='true'] {
		--opacity: 1;
	}

	.name {
		display: none;
		font-family: var(--sk-font-ui);
		font-size: var(--sk-font-size-ui-small);
	}

	.name {
		display: none;
		opacity: var(--opacity);

		@media (min-width: 600px) {
			display: inline-block;
			margin-right: 0.3rem;
		}
	}

	img {
		width: 2.3rem;
		height: 2.3rem;
		margin: 0 0.2rem 0 0.3rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: var(--sk-border-radius);
		transform: translateY(-0.1rem);
	}

	.menu {
		position: absolute;
		width: calc(100% + 1.6rem);
		min-width: 10em;
		top: 3rem;
		right: -1.6rem;
		background-color: var(--sk-back-2);
		padding: 0.8rem 1.6rem;
		z-index: 99;
		text-align: left;
		border-radius: 0.4rem;
		display: flex;
		flex-direction: column;
	}

	.menu button,
	.menu a {
		background-color: transparent;
		font-family: var(--sk-font-body);
		font-size: 1.6rem;
		opacity: 0.7;
		padding: 0.4rem 0;
		text-decoration: none;
		text-align: left;
		border: none;
		color: var(--sk-text-2);
	}

	.menu button:hover,
	.menu button:focus-visible,
	.menu a:hover,
	.menu a:focus-visible {
		opacity: 1;
		color: inherit;
	}
</style>
