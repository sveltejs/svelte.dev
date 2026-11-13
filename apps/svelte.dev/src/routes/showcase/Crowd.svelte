<!--@component
the many more, smaller and in rows across the whole width of the window, cut off at either side
like the logos on the home page. each row drifts slowly and without end, every other one the other
way, unless motion is paused or reduced, when the rows stay where they are and scroll by hand
-->
<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { on_screen } from './on-screen.ts';
	import { get_player } from './player.svelte.ts';
	import type { Site } from './sites.ts';
	import Tile from './Tile.svelte';

	interface Props {
		sites: Site[];
	}

	let { sites }: Props = $props();

	const player = get_player();

	/** how long each one takes to pass, in milliseconds, slow enough to read their names */
	const PACE = 16_000;

	/** a little quicker or slower from one row to the next, so the rows never keep in step */
	const PACES = [1, 1.1, 0.92, 1.06, 0.96];

	/** at least seven to a row, more than a window holds, so a row never runs out as it drifts */
	const rows = $derived.by(() => {
		const count = Math.max(1, Math.floor(sites.length / 7));

		return Array.from({ length: count }, (_, i) =>
			sites.slice(
				Math.round((i * sites.length) / count),
				Math.round(((i + 1) * sites.length) / count)
			)
		);
	});

	const moving = $derived(player.autoplay && !prefersReducedMotion.current);

	/** in the window, outside of which nothing drifts */
	let seen = $state(false);

	/** the row the mouse is over, which waits so what is in it can be clicked */
	let pointed = $state(-1);

	/** the row the keyboard is in, which stops and scrolls to what has focus */
	let focused = $state(-1);

	/**
	 * drifts a row for as long as it may, carrying on from wherever it was scrolled to by hand, and
	 * leaving it scrolled to wherever it had drifted to once it may not
	 */
	function drift(index: number) {
		return (row: HTMLElement) => {
			if (!moving || focused === index) return;

			const track = row.firstElementChild as HTMLElement;
			const [list, copy] = track.children as unknown as HTMLElement[];
			const reverse = index % 2 === 1;
			const duration = rows[index].length * PACE * PACES[index % PACES.length];

			/** how far it goes before the copy is where the list was, and it starts again unseen */
			const lap = () => copy.offsetLeft - list.offsetLeft;

			const animation = track.animate(
				[{ translate: '0' }, { translate: 'calc(-50% - var(--gap) / 2)' }],
				{ duration, iterations: Infinity, direction: reverse ? 'reverse' : 'normal' }
			);

			const from = (row.scrollLeft % lap()) / lap();
			animation.currentTime = (reverse ? 1 - from : from) * duration;

			row.classList.add('drifting');
			row.scrollLeft = 0;

			$effect(() => {
				if (seen && pointed !== index) animation.play();
				else animation.pause();
			});

			return () => {
				const at = ((Number(animation.currentTime) % duration) / duration) * lap();

				animation.cancel();
				row.classList.remove('drifting');
				row.scrollLeft = reverse ? lap() - at : at;

				// and to what the keyboard has reached, which may have been out of the window
				if (row.contains(document.activeElement)) {
					document.activeElement?.scrollIntoView({ inline: 'center', block: 'nearest' });
				}
			};
		};
	}
</script>

<div
	class="crowd"
	{@attach on_screen((entry) => (seen = entry.isIntersecting), { rootMargin: '10%' })}
>
	{#each rows as row, index}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="row"
			onpointerenter={(event) => event.pointerType === 'mouse' && (pointed = index)}
			onpointerleave={() => pointed === index && (pointed = -1)}
			onfocusin={(event) =>
				(event.target as HTMLElement).matches(':focus-visible') && (focused = index)}
			onfocusout={(event) =>
				!event.currentTarget.contains(event.relatedTarget as Node | null) &&
				focused === index &&
				(focused = -1)}
			{@attach drift(index)}
		>
			<div class="track">
				<ul>
					{#each row as site (site.id)}
						<li id={site.id}>{@render tile(site)}</li>
					{/each}
				</ul>

				<!-- the same again, following on, so the row has no end as it drifts. for the eye
				     and the pointer only -->
				<ul aria-hidden="true">
					{#each row as site (site.id)}
						<li>{@render tile(site, true)}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/each}
</div>

{#snippet tile(site: Site, copy = false)}
	<Tile
		{site}
		sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 39vw"
		compact
		still
		{copy}
	/>
{/snippet}

<style>
	/* as many across as fit in the window with part of one cut off at either side, faded out
	   towards the edges, all the same size */
	.crowd {
		--across: 3;
		--gap: 1.2rem;
		/* half of one more across than the window holds */
		--width: calc(100vw / (var(--across) - 0.5) - var(--gap));

		display: grid;
		/* as wide as the window and no wider, however long the rows are */
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
		margin-inline: calc(50% - 50vw);
		mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);

		@media (min-width: 640px) {
			--across: 4;
			--gap: 1.6rem;
		}

		@media (min-width: 1024px) {
			--across: 6;
		}
	}

	/* scrolled by hand where it does not drift, with no bar to show for it, like the edges of the
	   window it runs off */
	.row {
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scrollbar-width: none;

		&:global(.drifting) {
			overflow-x: clip;
		}

		/* every other one half of one along, so they do not line up in columns */
		&:nth-child(even) .track {
			margin-left: calc((var(--width) + var(--gap)) / -2);
		}
	}

	.track,
	ul {
		display: flex;
		gap: var(--gap);
		width: max-content;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* sized by the list item rather than the screenshot, which Safari otherwise redraws with a
	   flicker while scrolling */
	li {
		flex: none;
		width: var(--width);
		container-type: inline-size;
		scroll-margin-top: var(--anchor-offset);
	}
</style>
