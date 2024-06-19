<script context="module">
	const open_store = writable(false);

	/** @type {import('svelte/store').Writable<import('../types').NavigationLink | undefined>} */
	const current_menu_view = writable(undefined);

	const show_context_menu = writable(false);

	/** @type {import('svelte/store').Writable<import('../types').NavigationLink[]>} */
	const links_store = writable([]);

	export function open_nav() {
		if (get(open_store)) {
			open_store.set(false);
		} else {
			open_store.set(true);

			const segment = get(page).url.pathname.split('/')[1];
			current_menu_view.set(get(links_store).find((link) => link.prefix === segment));

			show_context_menu.set(!!get(current_menu_view)?.sections && !!get(current_menu_view));
		}
	}
</script>

<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { click_outside, focus_outside, trap } from '../actions';
	import { overlay_open, reduced_motion, theme } from '../stores';
	import { tick } from 'svelte';
	import { expoOut, quintOut } from 'svelte/easing';
	import { get, writable } from 'svelte/store';
	import Icon from '../components/Icon.svelte';
	import NavContextMenu from './NavContextMenu.svelte';

	/** @type {{open: boolean, links: import('../types').NavigationLink[], children?: import('svelte').Snippet, back_button?: import('svelte').Snippet}} */
	let { open = $bindable(), links, children, back_button } = $props();

	$open_store = open;
	$effect.pre(() => {
		$open_store = open;
	});

	$links_store = links;
	$effect.pre(() => {
		$links_store = links;
	});

	/** @type {NavContextMenu | undefined} */
	let nav_context_instance = $state();

	let menu_height = $state(0);
	let universal_menu_inner_height = $state(0);
	let ready = $state(false);

	/** @type {HTMLElement | undefined} */
	let universal_menu = $state();

	/** @type {HTMLButtonElement | undefined} */
	let menu_button = $state();

	function close() {
		open = false;
		$open_store = open;
	}

	afterNavigate(close);

	/**
	 * @param {HTMLElement} _
	 * @param {(current: boolean) => void} fn
	 */
	function mounted(_, fn) {
		// this is necessary to ensure that the menu-background height
		// is applied without an animation
		setTimeout(() => {
			fn(true);
		});

		return {
			destroy() {
				fn(false);
			}
		};
	}

	/**
	 * @param {HTMLElement} node
	 * @param {{easing?: (t: number) => number, duration?: number }} [params]
	 * @returns {import('svelte/transition').TransitionConfig}
	 */
	const slide = (node, { duration = 400, easing = expoOut } = {}) => {
		const height = $current_menu_view ? node.clientHeight : universal_menu_inner_height;

		return {
			css: (t, u) =>
				$reduced_motion
					? `opacity: ${t}`
					: `transform: translate3d(0, ${height * u}px, 0) scale3d(${0.9 + 0.1 * t}, ${
							0.9 + 0.1 * t
						}, 1)`,
			easing,
			duration
		};
	};

	$effect.pre(() => {
		$overlay_open = $open_store;
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			close();
			// we only manage focus when Esc is hit
			// otherwise, the navigation will reset focus
			tick().then(() => menu_button?.focus());
		}
	}}
/>

<div style="display: contents" use:click_outside={close} use:focus_outside={close}>
	<button
		aria-label="Toggle menu"
		aria-expanded={$open_store}
		class="menu-toggle"
		class:open
		bind:this={menu_button}
		onclick={open_nav}
	>
		<Icon name={$open_store ? 'close' : 'menu'} size="1em" />
	</button>

	{#if $open_store}
		<div class="menu" use:trap={{ reset_focus: false }}>
			<div class="mobile-main-menu" in:slide out:slide={{ duration: 500, easing: quintOut }}>
				<div
					class="menu-background"
					class:dark={$theme.current === 'dark'}
					class:ready
					style:height={$show_context_menu ? '99%' : `${universal_menu_inner_height}px`}
					style:--background={$show_context_menu ? 'var(--sk-back-3)' : null}
					use:mounted={(mounted) => (ready = mounted)}
				></div>

				<div
					class="clip"
					style:--height-difference="{menu_height - universal_menu_inner_height}px"
					ontransitionstart={(e) => {
						const target = /** @type {HTMLElement} */ (e.target);

						if (!target?.classList.contains('viewport')) return;
						if (e.propertyName !== 'transform') return;

						// we need to apply a clip-path during the transition so that the contents
						// are constrained to the menu background, but only while the transition
						// is running, otherwise it prevents the contents from being scrolled
						const a = 'calc(var(--height-difference) + 1px)';
						const b = '1px';

						const start = $show_context_menu ? a : b;
						const end = $show_context_menu ? b : a;

						const container = e.currentTarget;

						container.style.clipPath = `polygon(0% ${start}, 100% ${start}, 100% 100%, 0% 100%)`;

						setTimeout(() => {
							container.style.clipPath = `polygon(0% ${end}, 100% ${end}, 100% 100%, 0% 100%)`;
						}, 0);
					}}
					ontransitionend={(e) => {
						const target = /** @type {HTMLElement} */ (e.target);

						if (!target?.classList.contains('viewport')) return;
						if (e.propertyName !== 'transform') return;

						e.currentTarget.style.clipPath = '';

						// whenever we transition from one menu to the other, we need to move focus to the first item in the new menu
						if (!$show_context_menu) {
							universal_menu?.querySelector('a')?.focus();
						}
					}}
				>
					<div
						class="viewport"
						class:reduced-motion={$reduced_motion}
						class:offset={$show_context_menu}
						bind:clientHeight={menu_height}
					>
						<div class="universal" inert={$show_context_menu} bind:this={universal_menu}>
							<div class="contents" bind:clientHeight={universal_menu_inner_height}>
								{#each links as link}
									<div class="link-item" style:--button-width={link.sections ? '4rem' : '0'}>
										<a href={link.pathname}>
											{link.title}
										</a>

										{#if link.sections}
											<button
												class="related-menu-arrow"
												onclick={async (event) => {
													event.preventDefault();

													$current_menu_view = link;

													await tick();

													$show_context_menu = true;

													await tick();

													nav_context_instance?.scrollToActive();
												}}
												aria-label="Show {link.title} submenu"
											>
												<Icon name="arrow-right-chevron" size="6rem" />
											</button>
										{/if}
									</div>
								{/each}

								{@render children?.()}
							</div>
						</div>

						<div class="context" inert={!$show_context_menu}>
							{#if current_menu_view}
								<NavContextMenu
									bind:this={nav_context_instance}
									contents={$current_menu_view?.sections}
								/>
							{/if}
						</div>

						<button
							class="back-button"
							class:dark={$theme.current === 'dark'}
							onclick={() => ($show_context_menu = false)}
							inert={!show_context_menu}
						>
							<Icon name="arrow-left" size=".6em" />
							<span
								>{#if back_button}{@render back_button()}{:else}Back to main menu{/if}</span
							>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.menu {
		display: block;
		position: fixed;
		left: 0px;
		bottom: var(--bottom, var(--sk-nav-height));
		z-index: 1;
		width: 100%;
		height: 70vh;
		border-radius: 1rem 1rem 0 0;
		overflow-y: hidden;
		overflow-x: hidden;
		pointer-events: none;
		transform: translate3d(0, 0, 0);
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;

		height: 100%;
		width: var(--sk-nav-height);

		display: flex;
		gap: 1.5rem;

		line-height: 1;
	}

	.menu-background {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
		height: 99.5%;
		border-radius: 1rem 1rem 0 0;
		background: var(--background, var(--sk-back-2));
		will-change: height;
		transition: 0.4s var(--quint-out);
		transition-property: background;
		box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.19);
	}

	.menu-background.ready {
		transition-property: height, background;
	}

	.menu-background.dark {
		border-top: solid 1.1px hsla(0, 0%, 100%, 0.2);
	}

	.mobile-main-menu {
		height: 100%;
		contain: layout paint;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.clip {
		width: 100%;
		height: 100%;
		transition: clip-path 0.4s cubic-bezier(0.23, 1, 0.32, 1);
		will-change: clip-path;
	}

	.viewport {
		position: relative;
		bottom: -1px;

		display: grid;
		width: 200%;
		height: 100%;
		grid-template-columns: 50% 50%;
		transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
		grid-auto-rows: 100%;
	}

	.viewport.reduced-motion {
		/* we still want the transition events to fire for focus management */
		transition-duration: 0.01ms;
	}

	.viewport.offset {
		transform: translate3d(-50%, 0, 0);
	}

	.universal .contents {
		position: absolute;
		width: 50%;
		bottom: 0;
		padding: 1rem;
		max-height: 70vh;
		overflow-y: scroll;
	}

	.viewport > * {
		overflow-y: auto;
		transition: inherit;
		transition-property: transform, opacity;
	}

	.context {
		position: relative;
		height: 99%;
		bottom: -7px;
		padding-bottom: 2rem;
	}

	.back-button {
		position: absolute;
		bottom: -1px;
		right: 0;
		z-index: 9;

		display: flex;
		align-items: center;
		justify-content: start;
		gap: 1rem;

		font-size: 0.9em;
		color: var(--sk-text-3);

		background-color: var(--sk-back-3);

		box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.19);

		width: 50%;
		height: 48px;
		padding: 0 1.5rem;
	}

	.back-button.dark {
		border-top: solid 1px var(--sk-back-4);
		box-shadow: none;
	}

	.back-button :global(svg) {
		transform: scale(0.8);
	}

	.viewport :global(a) {
		position: relative;
		display: block;
		align-items: center;
		padding: 0.3rem 0;
		margin: 0.3rem 0;
		height: 4rem;
		color: var(--sk-text-2);
	}

	.universal .contents,
	.context,
	.back-button {
		pointer-events: all;
	}

	.universal .link-item {
		position: relative;
		padding-right: var(--button-width);
	}

	.universal .contents .link-item button {
		position: absolute;
		right: 0;
		top: 0;
		width: var(--button-width);
		height: 100%;
	}

	.viewport .link-item :global(svg) {
		stroke-width: 0;
	}

	.viewport :global(a) {
		display: flex;
		align-items: center;
		border-radius: var(--sk-border-radius);
		width: 100%;
		height: 100%;
		padding-left: 1rem;
	}

	.viewport :global(a[aria-current='true']) {
		background-color: hsla(var(--sk-theme-1-hsl), 0.05);
	}

	.viewport :global(a:hover),
	.related-menu-arrow:hover {
		border-radius: var(--sk-border-radius);

		text-decoration: none;

		background-color: var(--sk-back-4);
	}

	.viewport :global(a[aria-current='true']:hover) {
		background-color: hsla(var(--sk-theme-1-hsl), 0.05);
		color: var(--sk-theme-1);
	}
</style>
