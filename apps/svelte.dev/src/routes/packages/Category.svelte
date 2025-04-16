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
		const [a, b] = scroller.querySelectorAll('.item-proxy') as NodeListOf<HTMLElement>;
		const left = scroller.scrollLeft + d * (b.offsetLeft - a.offsetLeft);

		scroller.scrollTo({ left, behavior });
	}

	$effect(update);
</script>

<svelte:window onresize={update} />

<section class="category">
	<header>
		<div class="controls">
			<button disabled={at_start} aria-label="Previous" class="raised icon" onclick={() => go(-1)}
			></button>

			<button disabled={at_end} aria-label="Next" class="raised icon" onclick={() => go(1)}
			></button>
		</div>

		<h2>{title}</h2>
	</header>

	<div class="wrapper">
		<div
			class="viewport"
			onscroll={(e) => {
				// prevent focus-based scroll; handle this programmatically instead
				e.currentTarget.scrollTo(0, 0);
			}}
			onfocusin={(e) => {
				const item = e.currentTarget.querySelector('.item:focus-within') as HTMLElement;
				const left =
					item.offsetLeft - parseFloat(getComputedStyle(e.currentTarget).scrollPaddingLeft);

				scroller.scrollTo({ left, behavior });
			}}
		>
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
			class="viewport-proxy"
			onscroll={(e) => {
				const left = e.currentTarget.scrollLeft;
				content.style.translate = `-${left}px`;

				update();
			}}
		>
			<div class="content-proxy">
				{#each packages as pkg}
					<div class="item-proxy"></div>
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
		}
	}

	.wrapper {
		position: relative;
	}

	.viewport,
	.viewport-proxy {
		scroll-snap-type: x mandatory;
	}

	.viewport {
		position: relative;
		margin: 0 calc(-1 * var(--bleed));
		padding: 1em var(--bleed);
		scroll-padding: 0 var(--bleed);
		overflow: hidden;
		mask-image: linear-gradient(
			to right,
			transparent 0%,
			white var(--bleed),
			white calc(100% - var(--bleed)),
			transparent 100%
		);
	}

	.viewport-proxy {
		overflow-x: auto;
	}

	.content,
	.content-proxy {
		display: grid;
		grid-auto-columns: 34rem;
		grid-auto-flow: column;
		gap: 2rem;
		width: fit-content;
	}

	.item {
		height: 16rem;
	}

	.item,
	.item-proxy {
		scroll-snap-align: start;
	}

	.viewport-proxy {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		* {
			pointer-events: none;
			opacity: 0;
		}
	}
</style>
