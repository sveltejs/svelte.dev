<script lang="ts">
	import { Dropdown, HoverMenu, Icon } from '@sveltejs/site-kit/components';
	import type { Accounts } from '#lib/db/types.d.ts';
	import type { Destination } from '#lib/destination.js';
	import { account_for } from '#lib/destination.js';
	import { avatar_url, display_name } from '#lib/user.js';
	import Avatar from '#lib/components/Avatar.svelte';
	import { page } from '$app/state';
	import { get_app_context } from './app-context.js';

	const { login } = get_app_context();

	let { accounts, destination }: { accounts: Accounts; destination: Destination | null } = $props();

	const user = $derived(
		(destination && account_for(destination, accounts)) || accounts.github || accounts.atproto
	);
</script>

{#if user}
	<Dropdown align="right">
		<div class="user">
			<span class="name">{display_name(user)}</span>
			<Avatar src={avatar_url(user)} name={display_name(user)} size="2.3rem" />
			<Icon size={18} name="chevron-down" />
		</div>

		{#snippet dropdown()}
			<HoverMenu>
				<a href="/apps">Apps</a>
				<a href="/accounts">Accounts</a>
				{#if page.data.renew_atproto}
					<button class="renew" onclick={() => login('atproto')}>Renew Atmosphere login</button>
				{/if}
			</HoverMenu>
		{/snippet}
	</Dropdown>
{/if}

<style>
	.user {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0em 0 0 0.4rem;
		z-index: 99;
	}

	.name {
		display: none;

		@media (min-width: 600px) {
			display: inline-block;
			margin-right: 0.3rem;
			max-width: 16rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font: var(--sk-font-ui-medium);
		}
	}

	.renew {
		color: var(--sk-fg-accent);
	}

	.user :global(.avatar) {
		margin: 0 0.2rem 0 0.3rem;
		transform: translateY(-0.1rem);
	}
</style>
