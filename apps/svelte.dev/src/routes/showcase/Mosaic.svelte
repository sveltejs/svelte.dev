<!--@component
the sites of a category as a mosaic, the large ones taking a square and the rest as wide as the
rows need to come out even, as `arrange` lays them out
-->
<script lang="ts">
	import type { Tile as Placed } from './arrange.ts';
	import type { Clips } from './clips.svelte.ts';
	import Tile from './Tile.svelte';

	interface Props {
		tiles: Placed[];
		player: Clips;
	}

	let { tiles, player }: Props = $props();

	// widths of the screenshots as laid out below
	const sizes: Record<Placed['size'], string> = {
		big: '(min-width: 1440px) 680px, (min-width: 1280px) 48vw, (min-width: 740px) 64vw, (min-width: 640px) 48vw, 92vw',
		small:
			'(min-width: 1440px) 330px, (min-width: 1280px) 24vw, (min-width: 740px) 32vw, (min-width: 640px) 48vw, 92vw'
	};
</script>

<ul class="sites">
	{#each tiles as { site, size, right, fill } (site.id)}
		<li class={['site', size, { right }, fill && `fill-${fill}`]} id={site.id}>
			<Tile {site} {player} sizes={sizes[fill ? 'big' : size]} large={size === 'big'} />
		</li>
	{/each}
</ul>

<style>
	/* one across on phones, two on small tablets, three on tablets and small laptops, by six columns
	   so a short last row can widen to fill, and four on wider screens. the large one takes a square
	   from three across up */
	.sites {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-auto-flow: dense;
		gap: 4rem 2.4rem;
		margin: 0;
		padding: 0;
		list-style: none;

		/* on phones, one after another */
		@media (max-width: 639px) {
			row-gap: 3.2rem;
		}

		@media (min-width: 640px) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		@media (min-width: 740px) {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		@media (min-width: 1280px) {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 5.6rem 3.2rem;
		}
	}

	.site {
		position: relative;
		min-width: 0;
		scroll-margin-top: var(--anchor-offset);

		/* where three are across, two of the six columns each, the large one four columns and two rows
		   on alternate sides, and the one or two in a short last row widened to fill it */
		@media (min-width: 740px) and (max-width: 1279px) {
			grid-column: span 2;

			&.big {
				grid-column: span 4;
				grid-row: span 2;
			}

			&.big.right {
				grid-column: 3 / span 4;
			}

			&.fill-2 {
				grid-column: span 3;
			}

			&.fill-1 {
				grid-column: span 6;
			}
		}

		/* as large as two across and two down where there are four columns */
		@media (min-width: 1280px) {
			&.big {
				grid-column: span 2;
				grid-row: span 2;
			}

			&.big.right {
				grid-column: 3 / span 2;
			}
		}
	}
</style>
