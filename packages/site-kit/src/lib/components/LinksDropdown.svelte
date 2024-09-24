<script lang="ts">
	import { page } from '$app/stores';
	import type { NavigationLink } from '../types';

	let { links: _links, prefix }: { links: NavigationLink; prefix: string } = $props();

	const links = $derived([
		{ title: _links.title, path: _links.pathname },
		..._links.sections!.map((s) => ({ title: s.title, path: s.path! }))
	]);
	const current = $derived($page.url.pathname.startsWith(`/${prefix}`) ? 'page' : null);
</script>

<div class="dropdown">
	<a href={links[0].path} aria-current={current}>{links[0].title}</a>
	<nav class="dropdown-content">
		{#each links.slice(1) as link}
			<a href={link.path}>{link.title}</a>
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

			&:last-of-type {
				border-radius: var(--sk-border-radius);
			}
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
