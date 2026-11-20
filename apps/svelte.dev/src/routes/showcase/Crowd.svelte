<!--@component
the many more, smaller and in rows across the whole width of the window, cut off at either side
like the logos on the home page. each row drifts slowly and without end, every other one the other
way, and can be swiped along or back as it does, unless motion is paused or reduced, when the rows
stay where they are and scroll by hand
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

			// many laps in, so a hand can take it back as far as it likes without it running out
			const from = (row.scrollLeft % lap()) / lap();
			animation.currentTime = (1000 + (reverse ? 1 - from : from)) * duration;

			row.classList.add('drifting');
			row.scrollLeft = 0;

			$effect(() => {
				if (seen && pointed !== index) animation.play();
				else animation.pause();
			});

			/** how long it takes to drift a pixel to the left, less than none where it drifts right */
			const pace = () => ((reverse ? -1 : 1) * duration) / lap();

			let drag:
				| { id: number; x: number; from: number; samples: Array<{ t: number; x: number }> }
				| undefined;
			let start: { id: number; x: number; y: number } | undefined;
			let dragged = false;
			let settling = 0;

			/** eases from however fast it was let go, either way, back to its own drift */
			function settle(rate: number) {
				let then = performance.now();

				const step = (now: number) => {
					rate = 1 + (rate - 1) * Math.exp((then - now) / 500);
					then = now;
					if (Math.abs(rate - 1) < 0.05) rate = 1;

					animation.playbackRate = rate;
					if (rate !== 1) settling = requestAnimationFrame(step);
				};

				animation.playbackRate = rate;
				if (seen && pointed !== index) animation.play();
				settling = requestAnimationFrame(step);
			}

			// by a finger or a pen. a mouse stops the row by pointing at it, to click what is in it
			function down(event: PointerEvent) {
				if (event.pointerType === 'mouse' || !event.isPrimary) return;
				start = { id: event.pointerId, x: event.clientX, y: event.clientY };
				dragged = false;
			}

			function move(event: PointerEvent) {
				if (start && event.pointerId === start.id) {
					const dx = event.clientX - start.x;
					const dy = event.clientY - start.y;

					// up and down is the page scrolling, not the row
					if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) {
						if (Math.abs(dy) > 10) start = undefined;
						return;
					}

					// held from where it has drifted to by now, so it does not jump
					start = undefined;
					cancelAnimationFrame(settling);
					animation.pause();
					drag = {
						id: event.pointerId,
						x: event.clientX,
						from: Number(animation.currentTime),
						samples: []
					};
					try {
						row.setPointerCapture(event.pointerId);
					} catch {
						// the pointer has already gone
					}
				}

				if (!drag || event.pointerId !== drag.id) return;

				// under the finger, wherever it goes
				animation.currentTime = drag.from - (event.clientX - drag.x) * pace();

				drag.samples.push({ t: event.timeStamp, x: event.clientX });
				if (drag.samples.length > 5) drag.samples.shift();
			}

			function up(event: PointerEvent) {
				if (start?.id === event.pointerId) start = undefined;
				if (!drag || event.pointerId !== drag.id) return;

				const first = drag.samples[0];
				const last = drag.samples[drag.samples.length - 1];
				drag = undefined;
				dragged = true;

				// thrown on by however fast it was going as it was let go, in pixels a millisecond,
				// or left where it is if the finger had stopped first
				const fresh = last && event.timeStamp - last.t < 80;
				const velocity = fresh ? (last.x - first.x) / Math.max(last.t - first.t, 1) : 0;

				settle(-velocity * pace());
			}

			// the click that follows a drag on letting go, which should not open what it lands on
			function click(event: MouseEvent) {
				if (!dragged) return;
				dragged = false;
				event.preventDefault();
				event.stopPropagation();
			}

			// sideways scrolling on a trackpad moves it with the fingers
			function wheel(event: WheelEvent) {
				if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
				event.preventDefault();

				// in lines rather than pixels in some browsers with a mouse wheel
				const pixels = event.deltaMode === 1 ? event.deltaX * 16 : event.deltaX;
				animation.currentTime = Number(animation.currentTime) + pixels * pace();
			}

			const listeners = new AbortController();
			const { signal } = listeners;
			row.addEventListener('pointerdown', down, { signal });
			row.addEventListener('pointermove', move, { signal });
			row.addEventListener('pointerup', up, { signal });
			row.addEventListener('pointercancel', up, { signal });
			row.addEventListener('click', click, { signal, capture: true });
			row.addEventListener('wheel', wheel, { signal, passive: false });

			return () => {
				const at = ((Number(animation.currentTime) % duration) / duration) * lap();

				listeners.abort();
				cancelAnimationFrame(settling);
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
	<Tile {site} sizes="(min-width: 64em) 18vw, (min-width: 40em) 28vw, 39vw" compact still {copy} />
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

		@media (min-width: 40em) {
			--across: 4;
			--gap: 1.6rem;
		}

		@media (min-width: 64em) {
			--across: 6;
		}
	}

	/* scrolled by hand where it does not drift, with no bar to show for it, like the edges of the
	   window it runs off */
	.row {
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scrollbar-width: none;

		/* moved by hand as it drifts too, so only up and down is left to the page */
		&:global(.drifting) {
			overflow-x: clip;
			touch-action: pan-y pinch-zoom;
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
