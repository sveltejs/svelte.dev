<script lang="ts">
	import { page } from '$app/stores';
	// import { Icon } from './Icon.svelte';
	import type { NavigationLink } from '../types';
	import Dropdown from './Dropdown.svelte';

	let { link }: { link: NavigationLink } = $props();
</script>

<Dropdown>
	<a
		href="/{link.slug}"
		aria-current={$page.url.pathname.startsWith(`/${link.slug}`) ? 'page' : undefined}
	>
		{link.title}

		<Icon name="chevron-down" />
	</a>

	{#snippet dropdown()}
		{#each link.sections! as section}
			<a
				class="secondary"
				href={section.path}
				aria-current={$page.url.pathname === section.path || $page.url.pathname.startsWith(section.path!)
					? 'page'
					: undefined}
			>
				{section.title}
			</a>
		{/each}
	{/snippet}
</Dropdown>

<style>
	.secondary {
		box-shadow: none !important;
	}
</style>
