<!--@component
the sites of a category as a mosaic, the large ones taking a square and the rest as wide as the
rows need to come out even, as `arrange` lays them out
-->
<script lang="ts">
	import type { Tile as Placed } from './arrange.ts';
	import Tile from './Tile.svelte';

	interface Props {
		tiles: Placed[];
	}

	let { tiles }: Props = $props();

	// widths of the screenshots as laid out below
	const sizes: Record<Placed['size'], string> = {
		big: '(min-width: 90em) 680px, (min-width: 80em) 48vw, (min-width: 46.25em) 64vw, (min-width: 40em) 48vw, 92vw',
		small:
			'(min-width: 90em) 330px, (min-width: 80em) 24vw, (min-width: 46.25em) 32vw, (min-width: 40em) 48vw, 92vw'
	};
</script>

<ul class="sites">
	{#each tiles as { site, size, right, fill } (site.id)}
		<li class={['site', size, { right }, fill && `fill-${fill}`]} id={site.id}>
			<Tile {site} sizes={sizes[fill ? 'big' : size]} large={size === 'big'} />
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
		@media (max-width: 39.9375em) {
			row-gap: 3.2rem;
		}

		@media (min-width: 40em) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		@media (min-width: 46.25em) {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		@media (min-width: 80em) {
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
		@media (min-width: 46.25em) and (max-width: 79.9375em) {
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
		@media (min-width: 80em) {
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
