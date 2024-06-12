<script>
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { click_outside, focus_outside, root_scroll } from '$lib/actions';
	import Icon from '$lib/components/Icon.svelte';
	import {
		mql,
		nav_open,
		on_this_page_open,
		overlay_open,
		reduced_motion,
		theme
	} from '$lib/stores';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { readable } from 'svelte/store';
	import { slide } from 'svelte/transition';

	/** @type {{details: import('./types').Page, orientation?: 'auto' | 'inline' | 'aside', children?: import('svelte').Snippet}} */
	let { details, orientation = 'auto', children } = $props();

	const dispatch = createEventDispatcher();

	let hash = $state('');

	let height = 0;

	/** @type {HTMLElement} */
	let content;

	/** @type {NodeListOf<HTMLElement>} */
	let headings;

	/** @type {number[]} */
	let positions = [];

	/** @type {HTMLElement | undefined} */
	let containerEl = $state();

	let show_contents = false;

	const Z_INDICES = {
		BASE: 2,
		OPEN: 101
	};

	let mobile_z_index = $state(Z_INDICES.BASE);

	let is_mobile = $derived(
		orientation === 'auto' ? mql('(max-width: 1200px)') : readable(orientation === 'inline')
	);

	let pathname = $derived($page.url.pathname);

	$effect(() => {
		pathname;

		emulate_autoscroll();
	});

	$effect.pre(() => {
		$overlay_open = $on_this_page_open;
	});

	onMount(async () => {
		await document.fonts.ready;
		update();
		highlight();
	});

	$effect(() => {
		containerEl;
		hash;
		// bit of a hack — prevent sidebar scrolling if
		// TOC is open on mobile, or scroll came from within sidebar
		if ((show_contents && window.innerWidth < 832) || !content) return;

		const active = containerEl?.querySelector('.active');

		if (containerEl && active) {
			const { top, bottom } = active.getBoundingClientRect();
			const min = 100;
			const max = window.innerHeight - 100;

			if (top > max) {
				containerEl.scrollBy({
					top: top - max,
					left: 0,
					behavior: 'smooth'
				});
			} else if (bottom < min) {
				containerEl.scrollBy({
					top: bottom - min,
					left: 0,
					behavior: 'smooth'
				});
			}
		}
	});

	afterNavigate(() => {
		update();
		highlight();

		$on_this_page_open = false;
	});

	async function emulate_autoscroll() {
		if (browser) {
			const hash = $page.url.hash.replace(/^#/, '');

			await tick();

			const el = document.getElementById(hash);

			el?.scrollIntoView({ behavior: 'auto', block: 'start' });
		}
	}

	async function update() {
		const contentEl = /** @type {HTMLElement | null} */ (document.querySelector('.content'));

		if (!contentEl) return;

		content = contentEl;

		const { top } = content.getBoundingClientRect();
		headings = content.querySelectorAll('h2[id]');
		positions = Array.from(headings).map((heading) => {
			const style = getComputedStyle(heading);
			return heading.getBoundingClientRect().top - parseFloat(style.scrollMarginTop) - top;
		});
		height = window.innerHeight;
	}

	function highlight() {
		if (!content) return;

		const { top, bottom } = content.getBoundingClientRect();
		let i = headings.length;
		while (i--) {
			if (bottom - height < 50 || positions[i] + top < 100) {
				const heading = headings[i];
				hash = `#${heading.id}`;
				return;
			}
		}
		hash = '';
	}

	/** @param {URL} url */
	function select(url) {
		// belt...
		setTimeout(() => {
			hash = url.hash;
		});
		// ...and braces
		window.addEventListener(
			'scroll',
			() => {
				hash = url.hash;
			},
			{ once: true }
		);
	}

	function on_link_click() {
		$on_this_page_open = false;
		dispatch('select');
	}
</script>

<svelte:window
	use:root_scroll={highlight}
	onresize={update}
	onhashchange={() => select($page.url)}
/>

{#if !$is_mobile || ($is_mobile && details.sections.length > 0)}
	<aside
		class="on-this-page"
		class:mobile={$is_mobile}
		class:dark={$theme.current === 'dark'}
		style:z-index={mobile_z_index}
		bind:this={containerEl}
		use:click_outside={() => $is_mobile && ($on_this_page_open = false)}
		use:focus_outside={() => $is_mobile && ($on_this_page_open = false)}
	>
		<h2>
			<button
				class="heading"
				aria-expanded={$on_this_page_open}
				onclick={() => ($on_this_page_open = !$on_this_page_open)}
			>
				<span class="h2"
					>{#if children}{@render children()}{:else}On this page{/if}</span
				>

				<span class="expand-icon" class:inverted={$on_this_page_open}>
					<Icon name="chevron-down" />
				</span>
			</button>
			<span class="h2 desktop-only-heading"
				>{#if children}{@render children()}{:else}On this page{/if}</span
			>
		</h2>

		{#if (browser && !$is_mobile) || ($is_mobile && $on_this_page_open)}
			<nav
				aria-label="On this page"
				transition:slide={{ axis: 'y', easing: expoOut, duration: $reduced_motion ? 0 : 400 }}
				onintrostart={() => $on_this_page_open && (mobile_z_index = Z_INDICES.OPEN)}
				onoutrostart={async () => {
					await tick();

					if (!$on_this_page_open && $nav_open) {
						mobile_z_index = Z_INDICES.BASE;
					}
				}}
				onoutroend={() => !$on_this_page_open && (mobile_z_index = Z_INDICES.BASE)}
			>
				<ul>
					<li>
						<a
							href={details.path}
							aria-current={hash === '' ? 'page' : false}
							onclick={on_link_click}>{details.title}</a
						>
					</li>
					{#each details.sections as { title, slug }}
						<li>
							<a
								href={`#${slug}`}
								aria-current={`#${slug}` === hash ? 'page' : false}
								onclick={on_link_click}
							>
								{title}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</aside>
{/if}

<style>
	.on-this-page {
		display: var(--on-this-page-display);
		position: fixed;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 0 0;
		width: min(280px, calc(var(--sidebar-width) - var(--sk-page-padding-side)));
		max-height: calc(100vh - var(--sk-nav-height) - var(--sk-page-padding-top));
		top: var(--sk-nav-height);
		left: calc(100vw - (var(--sidebar-width)));
		overflow-y: auto;
		scrollbar-width: none;
		font-family: var(--sk-font);
	}
	.on-this-page::-webkit-scrollbar {
		display: none;
	}

	.heading {
		display: none;
	}

	h2 {
		/* override global styles */
		margin: 0;
		border: none;
		padding: 0 0.85rem;
	}

	.h2 {
		text-transform: uppercase;
		font-size: 1.4rem;
		font-weight: 400;
		margin: 0;
		padding: 0;
		color: var(--sk-text-3);
		text-align: start;
	}

	.desktop-only-heading {
		display: inline;
	}

	.heading :global(svg) {
		transform: translateY(-1px);
	}

	.expand-icon {
		padding: 0.5rem;
	}

	.expand-icon :global(svg) {
		transition: transform 0.4s var(--quint-out);
		transform-origin: center;
	}

	.expand-icon.inverted :global(svg) {
		transform: rotate3d(0, 0, 1, 180deg);
	}

	ul {
		list-style: none;
		margin-left: 0;
	}

	li {
		margin: 0.2rem;
	}

	li::before {
		content: none;
	}

	a {
		display: block;
		padding: 0.3rem 0.5rem;
		color: var(--sk-text-3);
		font-size: var(--sk-text-s);
		border-left: 2px solid transparent;
		box-shadow: none;

		transition: 0.4s var(--quint-out);
		transition-property: background, border-left;
	}

	a:hover {
		box-shadow: none;
		background: var(--sk-back-3);
	}

	a[aria-current='page'] {
		background: var(--sk-back-3);
		border-left-color: var(--sk-theme-1);
	}

	.on-this-page.mobile {
		--shadow: 0px 0px 14px rgba(0, 0, 0, 0.1);
		position: relative;
		top: 0;
		left: 0;
		z-index: 99;

		display: block;

		width: 100%;
		height: auto;
		padding: 0;

		margin: 5rem 0;

		overflow-y: initial;
	}

	.on-this-page.mobile.dark {
		--shadow: 0 0 0 1px var(--sk-back-4);
	}

	.on-this-page.mobile .desktop-only-heading {
		display: none;
	}

	.on-this-page.mobile .heading {
		position: relative;
		width: 100%;

		display: grid;
		align-items: center;
		grid-template-columns: 1fr auto;
		gap: 0.75rem;
		padding: 0.75rem 0.75rem;

		z-index: 2;

		box-shadow: var(--shadow);
		border-radius: var(--sk-border-radius);
		box-sizing: border-box;

		background-color: var(--sk-back-3);
	}

	.on-this-page.mobile .heading[aria-expanded='true'] {
		border-radius: var(--sk-border-radius) var(--sk-border-radius) 0 0;
	}

	.on-this-page.mobile h2 {
		padding: unset;
	}

	.on-this-page.mobile .h2 {
		font-size: var(--sk-text-s);
		line-height: 1;

		padding: 0.8rem 0.5rem;

		border: none;
	}

	.on-this-page.mobile .heading :global(svg) {
		display: block;
	}

	.on-this-page.mobile nav {
		position: absolute;
		top: 45px;
		left: 0;

		width: 100%;
		max-height: 50vh;

		overflow-y: auto;

		background-color: var(--sk-back-3);

		border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
		box-shadow: var(--shadow);
	}

	.on-this-page.mobile ul {
		margin: 0 !important;

		display: grid;
		gap: 0.5rem;
	}

	.on-this-page.mobile li {
		margin: 0rem;
	}

	.on-this-page.mobile li:first-child {
		display: none;
	}

	.on-this-page.mobile li:nth-child(2) {
		margin-top: 0.75rem;
	}

	.on-this-page.mobile li:last-child {
		margin-bottom: 0.75rem;
	}

	.on-this-page.mobile a {
		padding: 0.4rem 1.25rem;
		box-sizing: border-box;

		color: var(--sk-text-2);
	}

	.on-this-page.mobile a[aria-current='page'] {
		background-color: transparent;
		border-left: 0;
	}

	.on-this-page.mobile a:hover {
		text-decoration: none;
		background-color: initial;
	}
</style>
