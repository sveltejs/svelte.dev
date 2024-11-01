<!-- @component
Top navigation bar for the application. It provides a slot for the left side, the right side, and the center.
-->

<script lang="ts">
	import { overlay_open, searching, on_this_page_open } from '../stores';
	import Icon from '../components/Icon.svelte';
	import { page } from '$app/stores';
	import ThemeToggle from '../components/ThemeToggle.svelte';
	import MobileMenu from './MobileMenu.svelte';
	import type { NavigationLink } from '../types';
	import Dropdown from '../components/Dropdown.svelte';
	import { HoverMenu } from '../components';
	import Search from '../search/Search.svelte';
	import { tick } from 'svelte';
	import FontToggle from '../components/FontToggle.svelte';

	interface Props {
		home_title?: string;
		title: string | undefined;
		links: NavigationLink[];
	}

	let { home_title = 'Homepage', title, links }: Props = $props();

	let visible = $state(true);

	// mobile nav stuff
	let open = $state(false);
	let current = $state.raw<NavigationLink | undefined>();
	let menu_button: HTMLButtonElement;

	let nav: HTMLElement | undefined = $state();

	// Prevents navbar to show/hide when clicking in docs sidebar
	let hash_changed = false;
	function handle_hashchange() {
		hash_changed = true;
	}

	let last_scroll = 0;
	function handle_scroll() {
		const scroll = window.scrollY;
		if (!hash_changed) {
			visible = scroll === last_scroll ? visible : scroll < 50 || scroll < last_scroll;
		}

		last_scroll = scroll;
		hash_changed = false;
	}

	$effect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
	});
</script>

<svelte:window
	onscroll={handle_scroll}
	onhashchange={handle_hashchange}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') {
			open = false;
			// we only manage focus when Esc is hit
			// otherwise, the navigation will reset focus
			tick().then(() => menu_button.focus());
		}
	}}
/>

<nav
	bind:this={nav}
	class:visible
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
		<div class="links">
			{#each links as link}
				{#if link.sections?.[0].path}
					<Dropdown>
						<a
							href="/{link.slug}"
							aria-current={$page.url.pathname.startsWith(`/${link.slug}`) ? 'page' : undefined}
						>
							{link.title}

							<Icon name="chevron-down" />
						</a>

						{#snippet dropdown()}
							<HoverMenu>
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
							</HoverMenu>
						{/snippet}
					</Dropdown>
				{:else}
					<a
						href="/{link.slug}"
						aria-current={$page.url.pathname.startsWith(`/${link.slug}`) ? 'page' : null}
					>
						{link.title}
					</a>
				{/if}
			{/each}
		</div>

		<div class="menu">
			<Search />

			<div class="external-links">
				<a href="/chat" data-icon="discord" aria-label="Discord Chat"></a>
				<a href="https://github.com/sveltejs/svelte" data-icon="github" aria-label="GitHub Repo"
				></a>
			</div>

			<FontToggle />

			<ThemeToggle />
		</div>
	</div>

	<div class="mobile mobile-menu">
		<button
			aria-label="Search"
			class="raised icon search"
			onclick={() => {
				$searching = true;
			}}
		>
			<Icon name="search" size={18} />
		</button>

		<FontToggle />

		<ThemeToggle />

		<button
			bind:this={menu_button}
			aria-label="Toggle menu"
			aria-expanded={open}
			class="menu-toggle raised icon"
			class:open
			onclick={() => {
				open = !open;

				if (open) {
					const segment = $page.url.pathname.split('/')[1];
					current = links.find((link) => link.slug === segment);
				}
			}}
		>
			<Icon name={open ? 'close' : 'menu'} size={16} />
		</button>
	</div>
</nav>

{#if open}
	<div class="mobile">
		<MobileMenu {links} {current} onclose={() => (open = false)} />
	</div>
{/if}

<style>
	nav {
		position: fixed;
		display: flex;
		top: 0;
		z-index: 101;
		width: 100vw;
		height: var(--sk-nav-height);
		margin: 0 auto;
		padding: 0 var(--sk-page-padding-side);
		background-color: var(--sk-bg-2);
		font-family: var(--sk-font-family-body);
		user-select: none;
		isolation: isolate;
		font-family: var(--sk-font-family-ui);

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: -4px;
			width: 100%;
			height: 4px;
			background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
		}
	}

	a {
		font: var(--sk-font-ui-medium);
	}

	.current-section {
		display: flex;
		align-items: center;
		color: var(--sk-fg-3);
		margin-left: 0.4em;
		font: var(--sk-font-ui-medium);
	}

	@media (max-width: 831px) {
		nav {
			transition: transform 0.2s;
		}

		nav:not(.visible):not(:focus-within) {
			transform: translate(0, calc(var(--sk-nav-height)));
		}
	}

	button {
		color: var(--sk-fg-3);
	}

	.links {
		display: flex;
		width: 100%;
		align-items: center;

		a {
			color: var(--sk-fg-2);
			font: var(--sk-font-ui-medium);

			white-space: nowrap;
			height: 100%;
			display: flex;
			align-items: center;
			text-decoration: none;
			outline-offset: -2px;

			&:hover {
				box-shadow: inset 0 -1px 0 0 var(--sk-border);
			}

			&[aria-current='page'] {
				color: var(--sk-fg-accent);
				box-shadow: inset 0 -1px 0 0 currentColor;
			}

			&:not(.secondary) {
				padding: 0.1rem 0.8rem 0 0.8rem;
			}

			&.secondary {
				box-shadow: none;
				line-height: 1;
			}
		}
	}

	.menu {
		position: relative;
		display: flex;
		width: 100%;
		gap: 0.5rem;

		.external-links {
			display: flex;
			height: 100%;
			margin: 0 0.5rem;
		}
	}

	.home-link {
		--padding-right: 1rem;
		width: 3.4rem;
		height: 100%;
		background: url(../branding/svelte-logo.svg) no-repeat 0 50% / calc(100% - var(--padding-right))
			auto;
		padding: 0 var(--padding-right) 0 calc(var(--sk-page-padding-side) + 0rem);
	}

	.mobile-menu {
		display: flex;
		flex: 1;
		justify-content: end;
		align-items: center;
		gap: 0.5rem; /* TODO tokenize */
	}

	.desktop {
		display: none;
	}

	nav :global(.small) {
		display: block;
	}

	@media (max-width: 831px) {
		nav {
			top: unset;
			bottom: 0;
		}

		.menu {
			position: relative;
			display: none;
			width: 100%;
			background: var(--sk-bg-1);
			padding: 1rem var(--sk-page-padding-side);
		}

		nav :global(.large) {
			display: none;
		}
	}

	@media (min-width: 480px) {
		.home-link {
			width: 11.2rem;
			background: url(../branding/svelte.svg) no-repeat 0 50% / calc(100% - var(--padding-right))
				auto;
			padding: 0 var(--padding-right) 0 calc(var(--sk-page-padding-side) + 0rem);

			:root.dark & {
				background-image: url(../branding/svelte-dark.svg);
			}
		}
	}

	@media (min-width: 832px) {
		.home-link {
			--padding-right: 2rem;
			width: 13.2rem;
		}

		nav {
			display: grid;
			grid-template-columns: auto 1fr 1fr;

			&::after {
				top: auto;
				bottom: -4px;
				background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
			}
		}

		.menu {
			display: flex;
			width: auto;
			height: 100%;
			align-items: center;
		}

		.menu:last-child {
			justify-content: end;
		}

		.mobile {
			display: none;
		}

		.desktop {
			display: contents;

			[data-icon] {
				background: no-repeat 50% 50%;
				background-size: calc(100% - 1rem) auto;
				padding: 0 0.5rem;
				height: 100%;
			}

			[data-icon='discord'] {
				width: 3.4rem;
				background-image: url($lib/icons/discord-light.svg);

				:global(.dark) & {
					background-image: url($lib/icons/discord-dark.svg);
				}
			}

			[data-icon='github'] {
				width: 3rem;
				background-image: url($lib/icons/github-light.svg);

				:global(.dark) & {
					background-image: url($lib/icons/github-dark.svg);
				}
			}
		}

		nav :global(.small) {
			display: none;
		}
	}
</style>
