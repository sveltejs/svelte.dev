<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { trap } from '../actions';
	import { reduced_motion } from '../stores';
	import { tick } from 'svelte';
	import { expoOut, quintOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import Icon from '../components/Icon.svelte';
	import MobileSubMenu from './MobileSubMenu.svelte';
	import type { NavigationLink } from '../types';
	import ModalOverlay from '../components/ModalOverlay.svelte';

	interface Props {
		links: NavigationLink[];
		current: NavigationLink | undefined;
		onclose: () => void;
	}

	let { links, current, onclose }: Props = $props();

	// svelte-ignore state_referenced_locally
	let show_context_menu = $state(!!current?.sections);

	let nav_context_instance: ReturnType<typeof MobileSubMenu> | undefined = $state();

	let menu_height = $state(0);
	let universal_menu_inner_height = $state(0);
	let ready = $state(false);

	let universal_menu: HTMLElement | undefined = $state();

	// svelte-ignore state_referenced_locally
	afterNavigate(onclose);

	$effect(() => {
		// this is necessary to ensure that the menu-background height
		// is applied without an animation
		setTimeout(() => {
			ready = true;
		});
	});

	function popup(node: HTMLElement, { duration = 400, easing = expoOut } = {}): TransitionConfig {
		const height = current ? node.clientHeight : universal_menu_inner_height;

		return {
			css: (t, u) =>
				$reduced_motion
					? `opacity: ${t}`
					: `transform: translate3d(0, ${(height * u) / 0.9}px, 0) scale(${0.9 + 0.1 * t})`,
			easing,
			duration
		};
	}
</script>

<ModalOverlay {onclose} />

<div class="menu" use:trap={{ reset_focus: false }}>
	<div class="mobile-main-menu" transition:popup={{ duration: 200, easing: quintOut }}>
		<div
			class="menu-background"
			class:ready
			style:height={show_context_menu ? '100%' : `${universal_menu_inner_height}px`}
		></div>

		<div
			class="clip"
			style:--height-difference="{menu_height - universal_menu_inner_height}px"
			ontransitionstart={(e) => {
				const target = e.target as HTMLElement;

				if (!target?.classList.contains('viewport')) return;
				if (e.propertyName !== 'transform') return;

				// we need to apply a clip-path during the transition so that the contents
				// are constrained to the menu background, but only while the transition
				// is running, otherwise it prevents the contents from being scrolled
				const a = 'calc(var(--height-difference) + 1px)';
				const b = '1px';

				const start = show_context_menu ? a : b;
				const end = show_context_menu ? b : a;

				const container = e.currentTarget;

				container.style.clipPath = `polygon(0% ${start}, 100% ${start}, 100% 100%, 0% 100%)`;

				setTimeout(() => {
					container.style.clipPath = `polygon(0% ${end}, 100% ${end}, 100% 100%, 0% 100%)`;
				}, 0);
			}}
			ontransitionend={(e) => {
				const target = e.target as HTMLElement;

				if (!target?.classList.contains('viewport')) return;
				if (e.propertyName !== 'transform') return;

				e.currentTarget.style.clipPath = '';

				// whenever we transition from one menu to the other, we need to move focus to the first item in the new menu
				if (!show_context_menu) {
					universal_menu?.querySelector('a')?.focus();
				}
			}}
		>
			<div
				class="viewport"
				class:reduced-motion={$reduced_motion}
				class:offset={show_context_menu}
				bind:clientHeight={menu_height}
			>
				<div class="universal" inert={show_context_menu} bind:this={universal_menu}>
					<div class="contents" bind:clientHeight={universal_menu_inner_height}>
						<ul>
							{#each links as link}
								<li>
									<a href="/{link.slug}">
										{link.title}
									</a>

									{#if link.sections}
										<button
											class="raised icon"
											onclick={async (event) => {
												event.preventDefault();

												current = link;

												await tick();

												show_context_menu = true;

												await tick();

												nav_context_instance?.scrollToActive();
											}}
											aria-label="Show {link.title} submenu"
										>
											<Icon name="arrow-right-chevron" size={18} />
										</button>
									{/if}
								</li>
							{/each}
						</ul>

						<hr />

						<ul>
							<li><a href="/chat">Discord</a></li>
							<li><a href="https://bsky.app/profile/svelte.dev">Bluesky</a></li>
							<li>
								<a href="https://github.com/sveltejs">GitHub</a>
							</li>
						</ul>
					</div>
				</div>

				<div class="context" inert={!show_context_menu}>
					{#if current}
						<MobileSubMenu
							bind:this={nav_context_instance}
							title={current.title}
							contents={current.sections}
						/>
					{/if}
				</div>

				<label class="back-button">
					<button
						class="raised icon"
						onclick={() => (show_context_menu = false)}
						inert={!show_context_menu}
					>
						<Icon name="arrow-left" size={18} />
					</button>
					<span>Back to main menu</span>
				</label>
			</div>
		</div>
	</div>
</div>

<style>
	.menu {
		display: block;
		position: fixed;
		left: 0px;
		bottom: var(--bottom, var(--sk-nav-height));
		z-index: 100;
		width: 100%;
		height: 70vh;
		border-radius: 1rem 1rem 0 0;
		overflow-y: hidden;
		overflow-x: hidden;
		pointer-events: none;
		transform: translate3d(0, 0, 0);
		filter: var(--sk-shadow);
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		display: flex;
		gap: 1.5rem;
	}

	.menu-background {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
		height: 99.5%;
		border-radius: 1rem 1rem 0 0;
		background: var(--background, var(--sk-bg-2));
		will-change: height;
		transition: 0.3s var(--quint-out);
		transition-property: none;

		&.ready {
			transition-property: height;
		}

		:root.dark & {
			border-top: solid 1px var(--sk-raised-highlight);
		}
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
		transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		will-change: clip-path;
	}

	.viewport {
		position: relative;
		bottom: -1px;

		display: grid;
		width: 200%;
		height: 100%;
		grid-template-columns: 50% 50%;
		transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		grid-auto-rows: 100%;

		&.reduced-motion {
			/* we still want the transition events to fire for focus management */
			transition-duration: 0.01ms;
		}

		&.offset {
			transform: translate3d(-50%, 0, 0);
		}

		& > * {
			overflow-y: auto;
			transition: inherit;
			transition-property: transform, opacity;
		}

		& :global(a) {
			position: relative;
			padding: 0.3rem 0;
			color: inherit;
			font: var(--sk-font-ui-medium);
			width: 100%;
			height: 100%;
		}
	}

	.universal .contents {
		position: absolute;
		width: 50%;
		bottom: 0;
		padding: 1rem var(--sk-page-padding-side);
		max-height: 70vh;
		overflow-y: scroll;

		button {
			/* width: 2.6rem; */
			height: 2.6rem;
		}
	}

	.context {
		position: relative;
		height: 100%;
		bottom: -7px;
		padding-bottom: 2rem;
	}

	.back-button {
		position: absolute;
		bottom: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 1rem;
		font: var(--sk-font-ui-medium);
		color: var(--sk-fg-3);
		background-color: var(--sk-bg-2);
		width: 50%;
		height: 4.8rem;
		padding: 0 var(--sk-page-padding-side);
		z-index: 2;
	}

	.universal .contents,
	.context,
	.back-button {
		pointer-events: all;
	}

	.universal {
		ul {
			list-style: none;
			margin: 0;
		}

		li {
			display: flex;

			a {
				flex: 1;
			}
		}

		hr {
			margin: 0.5rem 0;
			height: 1px;
			background: var(--sk-border);
			border: none;
		}
	}
</style>
