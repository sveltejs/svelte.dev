<!--@component
pauses and plays everything that moves on its own: floating in the corner, or on phones under the
carousel while the hero shows, where the floating one would cover the carousel's own buttons
-->
<script lang="ts">
	import type { Clips } from './clips.svelte.ts';

	interface Props {
		player: Clips;
		/** in the corner of the window, or in the flow under the carousel on phones */
		where: 'float' | 'inline';
		/** on phones, out of the way while the hero shows */
		tucked?: boolean;
	}

	let { player, where, tucked = false }: Props = $props();
</script>

<button class={['autoplay', where, { tucked }]} onclick={() => player.toggle()}>
	<!-- both, one over the other, so one can turn into the other -->
	<span class="glyph" aria-hidden="true">
		<svg class={{ off: !player.autoplay }} viewBox="0 0 16 16" width="16" height="16">
			<path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
		</svg>
		<svg class={{ off: player.autoplay }} viewBox="0 0 16 16" width="16" height="16">
			<path d="M4 2.2v11.6L13.5 8z" />
		</svg>
	</span>
	<!-- both, one over the other with only the one that applies showing, so the button is as wide
	     either way -->
	<span class="wording">
		<span class={{ off: !player.autoplay }}>Pause motion</span>
		<span class={{ off: player.autoplay }}>Play motion</span>
	</span>
</button>

<style>
	/* where motion is reduced clips never play, so there is nothing for it to stop */
	.autoplay {
		@media (prefers-reduced-motion: reduce) {
			display: none;
		}

		position: fixed;
		right: 1.6rem;
		bottom: calc(1.6rem + env(safe-area-inset-bottom));
		z-index: 10;

		/* above the banner, which sits at the bottom of wider windows */
		@media (min-width: 832px) {
			bottom: calc(1.6rem + var(--sk-banner-height) + env(safe-area-inset-bottom));
		}
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.8rem 1.4rem;
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-1);
		background: var(--sk-bg-2);
		border: 1px solid var(--sk-border);
		border-radius: 10rem;
		box-shadow: 0 0.2rem 0.8rem rgb(0 0 0 / 0.15);

		/* pressed in a little, so it is felt to take the press */
		transition: scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

		&:active {
			scale: 0.97;
		}

		/* only the icon on phones, a round button, with its name still read out */
		@media (max-width: 739px) {
			justify-content: center;
			width: 4.4rem;
			height: 4.4rem;
			padding: 0;

			.wording {
				position: absolute;
				width: 1px;
				height: 1px;
				overflow: hidden;
				clip-path: inset(50%);
				white-space: nowrap;
			}
		}

		/* on phones, out of the way of the carousel while the hero shows, which has its own. back in
		   rising a little as the hero leaves, and out with a quicker fade alone */
		@media (max-width: 739px) {
			&.float {
				transition:
					opacity 0.2s var(--quint-out),
					transform 0.2s var(--quint-out),
					visibility 0s,
					translate 0.2s,
					scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			}

			/* but never while it has focus, which would otherwise be lost as it hides */
			&.tucked:not(:focus-within) {
				opacity: 0;
				transform: translateY(0.8rem);
				visibility: hidden;
				transition:
					opacity 0.12s ease,
					transform 0s 0.12s,
					visibility 0s 0.12s,
					translate 0.2s,
					scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			}
		}

		/* under the carousel, on phones only, with its name, in the flow rather than over it */
		&.inline {
			display: none;

			@media (max-width: 739px) and (prefers-reduced-motion: no-preference) {
				display: flex;
				position: static;
				grid-column: 1 / -1;
				justify-self: center;
				/* under the marks, though it comes first in the carousel, so the keyboard and screen
				   readers reach it before anything that moves */
				grid-row: 3;
				/* clear of the taller tap areas of the marks above it */
				margin-top: 1.6rem;
				width: auto;
				padding: 0 1.6rem;
				box-shadow: none;

				.wording {
					position: static;
					display: grid;
					width: auto;
					height: auto;
					overflow: visible;
					clip-path: none;
				}
			}
		}

		/* on small screens the nav is at the bottom, sliding away as the page scrolls down and back as
		   it scrolls up, so the button moves up over it while it shows, as quickly as it slides */
		@media (max-width: 831px) {
			transition:
				translate 0.2s,
				scale 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);

			:global(body:has(nav:is(.visible, :focus-within))) &.float {
				translate: 0 calc(-1 * var(--sk-nav-height));
			}
		}
	}

	.glyph {
		display: grid;
	}

	svg {
		grid-area: 1 / 1;
		fill: currentColor;
		transition:
			opacity 0.15s ease,
			scale 0.15s ease,
			filter 0.15s ease;

		&.off {
			opacity: 0;
			scale: 0.8;
			filter: blur(2px);
		}
	}

	.wording {
		display: grid;

		> span {
			grid-area: 1 / 1;
		}

		/* hidden from screen readers too, so the button is named by the one showing */
		.off {
			visibility: hidden;
		}
	}
</style>
