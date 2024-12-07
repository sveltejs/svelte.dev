<script lang="ts">
	import { tick } from 'svelte';
	import Text from '../components/Text.svelte';

	interface Props {
		html: string;
		x: number;
		y: number;
		onmouseenter: (event: any) => void;
		onmouseleave: (event: any) => void;
	}

	let { html, x, y, onmouseenter, onmouseleave }: Props = $props();

	let visible = $state(false);
	let tooltip: HTMLDivElement;
	let offset = $state(0);

	// container starts out at maxium size, then shrinks to prevent page scrolling to the right
	let width = $state('calc(100vw - 2 * var(--sk-page-padding-side))');

	// bit of a gross hack but it works — this prevents the
	// tooltip from disappearing off the side of the screen
	$effect(() => {
		(async () => {
			// first, measure the window with the tooltip hidden
			const window_width = window.innerWidth;

			// then, display the tooltip
			visible = true;
			await tick();

			// then, figure out how much padding we need
			const container_width = parseFloat(getComputedStyle(tooltip.parentElement!).width);
			const padding = (window_width - container_width) / 2;

			// then, calculate the necessary offset to ensure the
			// right edge of the tooltip is inside the padding
			const rect = tooltip.getBoundingClientRect();
			offset = Math.min(window_width - padding - rect.right, -20);

			width = rect.width + 'px';
		})();
	});
</script>

<div
	{onmouseenter}
	{onmouseleave}
	role="tooltip"
	class="tooltip-container"
	class:visible
	style:width
	style:left="{x}px"
	style:top="{y}px"
	style:--offset="{offset}px"
>
	<div bind:this={tooltip} class="tooltip">
		<Text>
			<span>{@html html}</span>
		</Text>
	</div>
</div>

<style>
	.tooltip-container {
		--bg: var(--sk-bg-2);
		--arrow-size: 0.6rem;
		display: none;
		position: absolute;
		transform: translate(var(--offset), calc(2rem + var(--arrow-size)));
		z-index: 2;
		filter: var(--sk-shadow);

		&.visible {
			display: block;
		}
	}

	.tooltip {
		background-color: var(--bg);
		text-align: left;
		padding: 1.6rem;
		border-radius: var(--sk-border-radius);
		font: var(--sk-font-body-small);
		display: inline-block;
		max-width: min(var(--sk-page-content-width), calc(100vw - 2 * var(--sk-page-padding-side)));
		max-height: 30rem;
		overflow-y: auto;

		:global {
			p,
			ol,
			ul {
				font: var(--sk-font-body-small);
			}

			.tags {
				display: grid;
				grid-template-columns: 8rem 1fr;
				align-items: baseline;

				.tag,
				.param {
					font: var(--sk-font-mono);
				}
			}
		}
	}

	.tooltip::after {
		content: '';
		position: absolute;
		left: calc(-1 * var(--offset) - var(--arrow-size));
		top: calc(-2 * var(--arrow-size));
		border: var(--arrow-size) solid transparent;
		border-bottom-color: var(--bg);
	}

	span {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
