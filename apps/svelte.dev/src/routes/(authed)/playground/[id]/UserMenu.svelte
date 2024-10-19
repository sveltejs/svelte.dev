<script lang="ts">
	import { Dropdown, HoverMenu, Icon } from '@sveltejs/site-kit/components';
	import { get_app_context } from '../../app-context';
	import type { User } from '$lib/db/session';

	const { logout } = get_app_context();

	let { user }: { user: User } = $props();

	let showMenu = $state(false);
	let name = $derived(user.github_name ?? user.github_login);
</script>

<Dropdown align="right">
	<div class="user">
		<span class="name">{name}</span>
		<img alt="{name} avatar" src={user.github_avatar_url} />
		<Icon size={18} name={showMenu ? 'chevron-up' : 'chevron-down'} />
	</div>

	{#snippet dropdown()}
		<HoverMenu>
			<a href="/apps">Your saved apps</a>
			<button onclick={logout}>Log out</button>
		</HoverMenu>
	{/snippet}
</Dropdown>

<style>
	.user {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0em 0 0 0.4rem;
		/* height: calc(var(--sk-secondary-nav-height) - 1.5rem); */
		z-index: 99;
	}

	.name {
		display: none;
		font: var(--sk-font-ui-medium);
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
</style>
