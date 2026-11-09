<!--@component
the many more, smaller and in rows across the whole width of the window, cut off at either side
like the logos on the home page, in the order given
-->
<script lang="ts">
	import type { Clips } from './clips.svelte.ts';
	import type { Site } from './sites.ts';
	import Tile from './Tile.svelte';

	interface Props {
		sites: Site[];
		player: Clips;
	}

	let { sites, player }: Props = $props();
</script>

<div class="crowd">
	<ul>
		{#each sites as site (site.id)}
			<li id={site.id}>
				<Tile
					{site}
					{player}
					sizes="(min-width: 1440px) 330px, (min-width: 1280px) 24vw, (min-width: 740px) 32vw, (min-width: 640px) 48vw, 92vw"
					compact
					still
				/>
			</li>
		{/each}
	</ul>
</div>

<style>
	/* as many across as fit in the window with part of one cut off at either side, faded out
	   towards the edges, all the same size and centred */
	.crowd {
		--across: 3;
		--gap: 1.2rem;
		/* half of one more across than the window holds, so with each row shifted a quarter of a
		   step either way, the one cut off at the end of a row still shows at least half */
		--width: calc(100vw / (var(--across) - 0.5) - var(--gap));

		/* in colour all the way down, above anything laid over the list it is in */
		position: relative;
		z-index: var(--lift, auto);
		margin-inline: calc(50% - 50vw);
		overflow-x: clip;
		/* the rows centred in the window, though wider than it */
		display: flex;
		justify-content: center;
		mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);

		@media (min-width: 640px) {
			--across: 4;
			--gap: 1.6rem;
		}

		@media (min-width: 1024px) {
			--across: 6;
		}
	}

	/* in rows as wide as that many, with the last row centred under the rest if it is short */
	ul {
		display: flex;
		flex: none;
		flex-wrap: wrap;
		justify-content: center;
		width: calc(var(--across) * var(--width) + (var(--across) - 1) * var(--gap));
		gap: var(--gap);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* sized by the list item rather than the screenshot, which Safari otherwise redraws with a
	   flicker while scrolling. every other row a quarter of a step to the left and the rest a
	   quarter to the right, so they are offset from each other by half of one, with at least half
	   of the one at either end showing */
	li {
		--shift: 1;
		width: var(--width);
		container-type: inline-size;
		scroll-margin-top: var(--anchor-offset);
		translate: calc(var(--shift) * (var(--width) + var(--gap)) / 4) 0;

		@media (max-width: 639px) {
			&:is(:nth-child(6n + 1), :nth-child(6n + 2), :nth-child(6n + 3)) {
				--shift: -1;
			}

			/* and a short last row not shifted either way, so it is centred under the rest */
			&:nth-child(3n + 1):nth-last-child(-n + 2),
			&:nth-child(3n + 1):nth-last-child(-n + 2) ~ li {
				--shift: 0;
			}

			/* and none left alone on a row of its own at the end, which looks stranded */
			&:last-child:nth-child(3n + 1) {
				display: none;
			}
		}

		@media (min-width: 640px) and (max-width: 1023px) {
			&:is(:nth-child(8n + 1), :nth-child(8n + 2), :nth-child(8n + 3), :nth-child(8n + 4)) {
				--shift: -1;
			}

			&:nth-child(4n + 1):nth-last-child(-n + 3),
			&:nth-child(4n + 1):nth-last-child(-n + 3) ~ li {
				--shift: 0;
			}

			&:last-child:nth-child(4n + 1) {
				display: none;
			}
		}

		@media (min-width: 1024px) {
			&:is(
				:nth-child(12n + 1),
				:nth-child(12n + 2),
				:nth-child(12n + 3),
				:nth-child(12n + 4),
				:nth-child(12n + 5),
				:nth-child(12n + 6)
			) {
				--shift: -1;
			}

			&:nth-child(6n + 1):nth-last-child(-n + 5),
			&:nth-child(6n + 1):nth-last-child(-n + 5) ~ li {
				--shift: 0;
			}

			&:last-child:nth-child(6n + 1) {
				display: none;
			}
		}
	}
</style>
