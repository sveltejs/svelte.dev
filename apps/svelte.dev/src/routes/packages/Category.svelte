<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { prefersReducedMotion } from 'svelte/motion';
	import PackageCard from './PackageCard.svelte';

	interface Props {
		title: string;
		packages: Package[];
	}

	let { title, packages }: Props = $props();

	let content: HTMLElement;
	let scroller: HTMLElement;

	let behavior = $derived<ScrollBehavior>(prefersReducedMotion.current ? 'instant' : 'smooth');

	let at_start = $state(true);
	let at_end = $state(true);

	function update() {
		at_start = scroller.scrollLeft === 0;
		at_end = scroller.scrollLeft + scroller.offsetWidth >= scroller.scrollWidth;
	}

	function go(d: number) {
		const [a, b] = scroller.querySelectorAll('.item') as NodeListOf<HTMLElement>;
		const left = scroller.scrollLeft + d * (b.offsetLeft - a.offsetLeft);

		scroller.scrollTo({ left, behavior });
	}

	$effect(update);
</script>

<svelte:window onresize={update} />

<section class="category">
	<header>
		<h2>{title}</h2>

		{#if !at_start || !at_end}
			<div class="controls">
				<button disabled={at_start} aria-label="Previous" class="raised icon" onclick={() => go(-1)}
				></button>

				<button disabled={at_end} aria-label="Next" class="raised icon" onclick={() => go(1)}
				></button>
			</div>
		{/if}
	</header>

	<div class="wrapper">
		<!-- we duplicate the DOM for the sake of the gradient effect -
		     without this, the scrollbar extends beyond the content area -->
		<div inert class="viewport">
			<div bind:this={content} class="content">
				{#each packages as pkg}
					<div class="item">
						<PackageCard {pkg} />
					</div>
				{/each}
			</div>
		</div>

		<div
			bind:this={scroller}
			class="viewport"
			onscroll={(e) => {
				const left = e.currentTarget.scrollLeft;
				content.style.translate = `-${left}px`;

				update();
			}}
		>
			<div class="content">
				{#each packages as pkg}
					<div class="item">
						<PackageCard {pkg} />
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.category {
		--bleed: var(--sk-page-padding-side);
		margin-bottom: 4rem;
	}

	header {
		display: flex;
		margin-bottom: 1rem;
		align-items: center;
		gap: 2rem;

		h2 {
			flex: 1;
		}

		.controls {
			display: flex;
			gap: 0.5rem;
		}

		button {
			background: var(--sk-bg-3);

			&::after {
				content: '';
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
				background: currentColor;
				mask: url(icons/chevron) 50% 50% no-repeat;
				mask-size: 2rem 2rem;
			}

			&[aria-label='Next']::after {
				rotate: 180deg;
			}

			&:disabled {
				background: none;
			}
		}
	}

	.wrapper {
		position: relative;
	}

	.viewport {
		overscroll-behavior: contain;
		scroll-snap-type: x mandatory;

		&[inert] {
			position: relative;
			margin: 0 calc(-1 * var(--bleed));
			padding: 1rem var(--bleed);
			scroll-padding: 0 var(--bleed);
			overflow: hidden;
			mask-image: linear-gradient(
				to right,
				rgb(0 0 0 / 0) 0%,
				rgb(0 0 0 / 0.5) var(--bleed),
				rgb(0 0 0 / 1) var(--bleed),
				rgb(0 0 0 / 1) calc(100% - var(--bleed)),
				rgb(0 0 0 / 0.5) calc(100% - var(--bleed)),
				rgb(0 0 0 / 0) 100%
			);
		}

		&:not([inert]) {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			overflow-x: auto;
			padding: 1rem 0;
		}
	}

	.content {
		display: grid;
		grid-auto-columns: 34rem;
		grid-auto-flow: column;
		gap: 2rem;
		width: fit-content;
	}

	.item {
		height: 16rem;
		scroll-snap-align: start;
	}
</style>
