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
	}

	.dropdown-content {
		display: none;
		position: absolute;
		left: -1rem;
		background-color: var(--sk-back-1);
		min-width: 10rem;
		z-index: 1;
		animation: flyout 0.3s ease-in-out;
		box-shadow: var(--sk-shadow);
		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
	}

	@keyframes flyout {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown:hover .dropdown-content {
		display: block;
	}

	.dropdown-content a {
		color: var(--sk-text-3);
		padding: 1.3rem;
		text-decoration: none;
		display: block;
		margin: 0 !important;

		&:last-of-type {
			border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		}
	}

	.dropdown-content a:hover {
		background-color: var(--sk-back-4);
	}
</style>
