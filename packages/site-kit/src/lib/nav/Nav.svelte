<!-- @component
Top navigation bar for the application. It provides a slot for the left side, the right side, and the center.
-->

<script lang="ts">
	import { root_scroll } from '../actions';
	import { root_scroll_element } from '../actions/root-scroll';
	import { overlay_open, searching, theme, nav_open, on_this_page_open } from '../stores';
	import Icon from '../components/Icon.svelte';
	import { page } from '$app/stores';
	import ThemeToggle from '../components/ThemeToggle.svelte';
	import Menu from './Menu.svelte';
	import Separator from './Separator.svelte';
	import type { NavigationLink } from '../types';
	import type { Snippet } from 'svelte';
	import LinksDropdown from '../components/LinksDropdown.svelte';

	interface Props {
		home_title?: string;
		title: string | undefined;
		links: NavigationLink[];
		search?: Snippet;
		external_links?: Snippet;
	}

	let { home_title = 'Homepage', title, links, search, external_links }: Props = $props();

	let visible = $state(true);

	let nav: HTMLElement | undefined = $state();

	// Prevents navbar to show/hide when clicking in docs sidebar
	let hash_changed = false;
	function handle_hashchange() {
		hash_changed = true;
	}

	let last_scroll = 0;
	function handle_scroll() {
		if (!root_scroll_element) return;

		const scroll = root_scroll_element.scrollTop;
		if (!hash_changed) {
			visible = scroll === last_scroll ? visible : scroll < 50 || scroll < last_scroll;
		}

		last_scroll = scroll;
		hash_changed = false;
	}

	function handle_focus() {
		if ($nav_open && !nav?.contains(document.activeElement)) {
			$nav_open = false;
		}
	}
</script>

<svelte:window
	use:root_scroll={handle_scroll}
	onhashchange={handle_hashchange}
	onfocusin={handle_focus}
/>

<nav
	bind:this={nav}
	class:visible={visible || $nav_open}
	class:$nav_open
	class:dark={$theme.current === 'dark'}
	style:z-index={$overlay_open && ($searching || $on_this_page_open) ? 80 : null}
	aria-label="Primary"
>
	<a class="home-link" href="/" title={home_title} aria-label="Svelte"></a>

	{#if title}
		<div class="current-section mobile">
			{title}
		</div>
	{/if}

	<div class="desktop">
		<div class="menu">
			{#each links as link}
				{#if link.sections?.[0].path}
					<LinksDropdown {link} />
				{:else}
					<a
						href={link.pathname}
						aria-current={$page.url.pathname.startsWith(`/${link.prefix}`) ? 'page' : null}
					>
						{link.title}
					</a>
				{/if}
			{/each}
		</div>

		<div class="menu">
			{@render search?.()}

			{@render external_links?.()}

			<div class="appearance">
				<span class="caption">Theme</span>
				<ThemeToggle />
			</div>
		</div>
	</div>

	<div class="mobile mobile-menu">
		<button
			aria-label="Search"
			class="search"
			onclick={() => {
				$searching = true;
			}}
		>
			<Icon name="search" size=".6em" />
		</button>

		<Menu bind:open={$nav_open} {links}>
			<Separator />

			{@render external_links?.()}

			<Separator />

			<div class="appearance">
				<span class="caption">Theme</span>
				<ThemeToggle />
			</div>
		</Menu>
	</div>
</nav>

<style>
	nav {
		position: fixed;
		display: flex;
		top: 0;
		z-index: 100;
		width: 100vw;
		height: var(--sk-nav-height);
		margin: 0 auto;
		background-color: var(--sk-back-2);
		font-family: var(--sk-font-body);
		user-select: none;
		transition: 0.4s var(--quint-out);
		transition-property: transform, background;
		isolation: isolate;
		font-family: var(--sk-font-ui);
	}

	nav::after {
		content: '';
		position: absolute;
		left: 0;
		top: -4px;
		width: 100%;
		height: 4px;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
	}

	.current-section {
		display: flex;
		align-items: center;
		font-size: 0.8em;
		color: var(--sk-text-3);
		margin-left: 0.4em;
		padding: 0.1rem 0 0 0;
	}

	@media (max-width: 800px) {
		nav:not(.visible):not(:focus-within) {
			transform: translate(0, calc(var(--sk-nav-height)));
		}
	}

	.menu {
		position: relative;
		display: flex;
		width: 100%;
	}

	.menu :global(a) {
		color: var(--sk-text-2);
		line-height: 1;
		padding: 0.1rem 0.5rem 0 0.5rem;
		white-space: nowrap;
		height: 100%;
		display: flex;
		align-items: center;
		text-decoration: none;

		&:hover {
			box-shadow: inset 0 -1px 0 0 var(--sk-back-5);
		}
	}

	.menu :global(a[aria-current='page']) {
		color: var(--sk-theme-1);
		box-shadow: inset 0 -1px 0 0 currentColor;
	}

	.home-link {
		--padding-right: 1rem;
		width: 13rem;
		height: 100%;
		background: url(../branding/svelte.svg) no-repeat var(--sk-page-padding-side) 50% /
			calc(100% - var(--sk-page-padding-side) - var(--padding-right)) auto;
		padding: 0 var(--padding-right) 0 calc(var(--sk-page-padding-side) + 0rem);

		:global(.dark) & {
			background-image: url(../branding/svelte-dark.svg);
		}
	}

	.mobile-menu {
		display: flex;
		position: absolute;
		bottom: 0;
		right: 0;
		height: 100%;
	}

	.desktop {
		display: none;
	}

	nav :global(.small) {
		display: block;
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		display: flex;
		gap: 1.5rem;
		padding: 0 1rem;
		line-height: 1;
	}

	.search {
		padding-left: 2rem;
	}

	.appearance {
		display: flex;
		align-items: center;
		margin-left: 1.5rem;
	}

	.appearance .caption {
		display: none;
		font-size: var(--sk-text-xs);
		line-height: 1;
		margin-right: 0rem;
	}

	@media (max-width: 799px) {
		nav {
			top: unset;
			bottom: 0;
		}

		.menu {
			position: relative;
			display: none;
			width: 100%;
			background: var(--sk-back-1);
			padding: 1rem var(--sk-page-padding-side);
		}

		.appearance {
			position: relative;
			display: flex;
			padding: 1.5rem 0;
			justify-content: space-between;
		}

		.appearance .caption {
			display: block;

			font-size: var(--sk-text-s);
		}

		nav :global(.large) {
			display: none;
		}
	}

	@media (min-width: 800px) {
		.home-link {
			--padding-right: 2rem;
			width: 18rem;
		}

		nav {
			display: grid;
			grid-template-columns: auto 1fr 1fr;
		}

		nav::after {
			top: auto;
			bottom: -4px;
			background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
		}

		.menu {
			display: flex;
			width: auto;
			height: 100%;
			align-items: center;
			padding: 0 var(--sk-page-padding-side) 0 0;
		}

		.menu:last-child {
			justify-content: end;
		}

		.mobile {
			display: none;
		}

		.desktop {
			display: contents;
		}

		nav :global(.small) {
			display: none;
		}
	}
</style>
