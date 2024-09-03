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
		home_large?: Snippet;
		home_small?: Snippet;
		search?: Snippet;
		external_links?: Snippet;
		theme_label?: Snippet;
	}

	let {
		home_title = 'Homepage',
		title,
		links,
		home_large,
		home_small,
		search,
		external_links,
		theme_label
	}: Props = $props();

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
	<a class="home-link" href="/" title={home_title}>
		<span class="home-large">
			{@render home_large?.()}
		</span>

		<span class="home-small">
			{@render home_small?.()}
		</span>
	</a>

	{#if title}
		<div class="current-section mobile">
			｜ {title}
		</div>
	{/if}

	<div class="desktop">
		<div class="center-area">
			{@render search?.()}
		</div>

		<div class="menu">
			{#each links as link}
				{#if link.sections?.[0].path}
					<LinksDropdown links={link} prefix={link.prefix} />
				{:else}
					<a
						href={link.pathname}
						aria-current={$page.url.pathname.startsWith(`/${link.prefix}`) ? 'page' : null}
					>
						{link.title}
					</a>
				{/if}
			{/each}

			<Separator />

			{@render external_links?.()}

			<div class="appearance">
				<span class="caption"
					>{#if theme_label}{@render theme_label()}{:else}Theme{/if}</span
				>
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
				<span class="caption"
					>{#if theme_label}{@render theme_label()}{:else}Theme{/if}</span
				>
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
		font-family: var(--sk-font);
		user-select: none;
		transition: 0.4s var(--quint-out);
		transition-property: transform, background;
		isolation: isolate;
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
		margin: 0 0.3em;
		white-space: nowrap;
	}

	.menu :global(a[aria-current='page']) {
		color: var(--sk-theme-1);
		box-shadow: inset 0 -1px 0 0 var(--sk-theme-1);
	}

	.menu :global(a[aria-current='page']:hover) {
		text-decoration: none;
	}

	.home-link {
		max-width: max-content;
		height: 100%;
		display: flex;
		background-image: url(../branding/svelte-logo.svg);
		background-position: calc(var(--sk-page-padding-side) - 1rem) 50%;
		background-repeat: no-repeat;
		background-size: auto 70%;
		align-items: center;
		padding-left: calc(var(--sk-page-padding-side) + 4rem);
		padding-top: 5px; /* center vertically relative to logo */
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 1.8rem;
		color: var(--sk-text-4);
	}

	.home-small {
		display: none;

		margin-left: -0.75rem;
	}

	.home-large {
		display: block;
		color: var(--sk-text-4);
	}

	.home-link :global(strong) {
		color: var(--sk-text-1);
		font-weight: inherit;
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
		margin-left: 0.75rem;
	}

	.appearance .caption {
		display: none;
		font-size: var(--sk-text-xs);
		line-height: 1;
		margin-right: 0.5rem;
	}

	@media (max-width: 799px) {
		nav {
			top: unset;
			bottom: 0;
		}

		.home-small {
			display: block;
		}

		.home-large {
			display: none;
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

	.desktop .center-area {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	@media (min-width: 800px) {
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

	@media (min-width: 1240px) {
		nav {
			display: grid;
			grid-template-columns: 1fr auto 1fr;
		}
	}
</style>
