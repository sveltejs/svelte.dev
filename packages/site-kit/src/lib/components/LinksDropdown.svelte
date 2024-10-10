<script lang="ts">
	import { page } from '$app/stores';
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

		<svg
			width="1.8rem"
			height="1.8rem"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6 9.5L12 15.5L18 9.5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
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
