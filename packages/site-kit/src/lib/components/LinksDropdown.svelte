<script lang="ts">
	import { page } from '$app/stores';
	import type { NavigationLink } from '../types';

	let { link }: { link: NavigationLink } = $props();
</script>

<div class="dropdown">
	<a
		href={link.pathname}
		aria-current={$page.url.pathname.startsWith(`/${link.prefix}`) ? 'page' : undefined}
	>
		{link.title}
	</a>

	<nav class="dropdown-content">
		{#each link.sections! as section}
			<a
				href={section.path}
				aria-current={$page.url.pathname === section.path || $page.url.pathname.startsWith(section.path!)
					? 'page'
					: undefined}
			>
				{section.title}
			</a>
		{/each}
	</nav>
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
		height: 100%;
	}

	.dropdown-content {
		opacity: 0;
		pointer-events: none;
		position: absolute;
		left: -1rem;
		top: calc(100% - 1rem);
		background-color: var(--sk-back-2);
		min-width: 10rem;
		z-index: 1;
		box-shadow: var(--sk-shadow);
		border-radius: var(--sk-border-radius);

		a {
			color: var(--sk-text-3);
			padding: 1.3rem !important;
			text-decoration: none;
			display: block;
			margin: 0 !important;
			box-shadow: none !important;
		}

		a:hover {
			background-color: var(--sk-back-4);
		}
	}

	.dropdown:hover .dropdown-content,
	.dropdown:focus-within .dropdown-content {
		opacity: 1;
		pointer-events: all;
	}
</style>
