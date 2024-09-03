<script lang="ts">
	import { page } from '$app/stores';
	import type { NavigationLink } from '../types';

	let { links: _links, prefix }: { links: string[] | NavigationLink; prefix: string } = $props();

	const links = $derived(
		Array.isArray(_links)
			? _links.map((l) => ({ title: l, path: l }))
			: [
					{ title: _links.title, path: _links.pathname },
					..._links.sections!.map((s) => ({ title: s.title, path: s.path! }))
				]
	);
</script>

<div class="dropdown">
	<a
		href={links[0].path}
		class="main-action"
		aria-current={$page.url.pathname.startsWith(`/${prefix}`) ? 'page' : null}>{links[0].title}</a
	>
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
		background-color: var(--sk-back-1);
		min-width: 10rem;
		box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
		z-index: 1;
		animation: flyout 0.3s ease-in-out;
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
		padding: 12px 16px;
		text-decoration: none;
		display: block;
		margin: 0 !important;
	}

	.dropdown-content a:hover {
		background-color: var(--sk-back-4);
	}
</style>
