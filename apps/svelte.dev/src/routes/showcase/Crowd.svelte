<!--@component
the many more, smaller and in rows across the whole width of the window, cut off at either side
like the logos on the home page. each row drifts slowly and without end, every other one the other
way, and can be swiped along or back as it does, unless motion is paused or reduced, when the rows
stay where they are and scroll by hand. tab stops once at each row, and the arrow keys go along it
and from row to row
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

	/** which one in each row tab stops at, the first until the arrow keys have been along it */
	const stops = $state<Record<number, number>>({});

	const uid = $props.id();

	/** the links of a row, without those of its copy */
	function links(row: HTMLElement) {
		return [...row.querySelectorAll<HTMLElement>('ul:not([aria-hidden]) a')];
	}

	/** how much of a row at either end fades out, where what has focus is not left */
	const FADE = 0.15;

	/** the scrolling of each row that is on its way somewhere */
	const glides = new WeakMap<HTMLElement, number>();

	/**
	 * scrolls a row to where it should be, quickly and easing to a stop, a little longer the further
	 * it has to go, so the eye can follow where the row went. from wherever it is by now, if it was
	 * already on its way somewhere else. at once where motion is reduced
	 */
	function glide(row: HTMLElement, to: number) {
		cancelAnimationFrame(glides.get(row) ?? 0);

		const from = row.scrollLeft;
		to = Math.max(0, Math.min(to, row.scrollWidth - row.clientWidth));

		const distance = Math.abs(to - from);
		if (distance < 1) return;

		if (prefersReducedMotion.current) {
			row.scrollLeft = to;
			return;
		}

		const duration = Math.min(350, 180 + distance / 8);
		const start = performance.now();

		const step = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			row.scrollLeft = from + (to - from) * (1 - (1 - t) ** 4);
			if (t < 1) glides.set(row, requestAnimationFrame(step));
		};

		glides.set(row, requestAnimationFrame(step));
	}

	/**
	 * the one the keyboard is going to in another row, and where across the window the one it was
	 * picked by was, which may have been its copy
	 */
	let want: { link: HTMLElement; left: number } | undefined;

	/**
	 * brings what has focus in a row that stands still clear of where the row fades out at either
	 * end, moving the row no further than that takes, and not at all if it already is
	 */
	function reveal(row: HTMLElement) {
		const link = document.activeElement as HTMLElement | null;
		if (!link || !row.contains(link)) return;

		// first to where the one it was picked by was, without a move to be seen, since a copy looks
		// the same as what it is a copy of
		if (want?.link === link) {
			cancelAnimationFrame(glides.get(row) ?? 0);
			row.scrollLeft += link.getBoundingClientRect().left - want.left;
		}

		want = undefined;

		const bounds = row.getBoundingClientRect();
		const rect = link.getBoundingClientRect();
		const left = bounds.left + bounds.width * FADE;
		const right = bounds.right - bounds.width * FADE;

		if (rect.left < left) glide(row, row.scrollLeft + rect.left - left);
		else if (rect.right > right) glide(row, row.scrollLeft + rect.right - right);
	}

	/** tab stops where the keyboard last was in the row, however it got there */
	function enter(event: FocusEvent & { currentTarget: HTMLElement }, index: number) {
		const row = event.currentTarget;
		const target = event.target as HTMLElement;
		const at = links(row).indexOf(target);

		if (at !== -1) stops[index] = at;
		if (!target.matches(':focus-visible')) return;

		focused = index;

		// one that drifts does this as it stops
		if (!row.classList.contains('drifting')) reveal(row);
	}

	/**
	 * the arrow keys go along the row, round from its last to its first as the row itself does, and
	 * up and down to whichever is nearest above or below in the next row, and home and end to
	 * either end of the row, so that tab can leave for the next row from anywhere in it
	 */
	function keys(event: KeyboardEvent & { currentTarget: HTMLElement }) {
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

		const row = event.currentTarget;
		const all = links(row);
		const at = all.indexOf(event.target as HTMLElement);
		if (at === -1) return;

		let to: HTMLElement | undefined;

		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const next = event.key === 'ArrowUp' ? row.previousElementSibling : row.nextElementSibling;
			if (!(next instanceof HTMLElement) || !next.classList.contains('row')) return;

			// the nearest across, of all that are in the row, and what it is a copy of if it is one
			const rect = all[at].getBoundingClientRect();
			const middle = rect.left + rect.width / 2;
			let nearest = Infinity;

			for (const list of next.querySelectorAll('ul')) {
				[...list.querySelectorAll('a')].forEach((link, i) => {
					const { left, width } = link.getBoundingClientRect();
					const away = Math.abs(left + width / 2 - middle);
					if (away >= nearest) return;

					nearest = away;
					to = links(next)[i];
					want = { link: to, left };
				});
			}
		} else {
			to =
				all[
					{
						ArrowRight: (at + 1) % all.length,
						ArrowLeft: (at - 1 + all.length) % all.length,
						Home: 0,
						End: all.length - 1
					}[event.key] ?? -1
				];
		}

		if (!to) return;
		event.preventDefault();

		// the row moved by reveal, and the page only as far as shows the row
		to.focus({ preventScroll: true });
		to.closest('.row')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	/** the rows that have been put where they start from */
	const placed = new WeakSet<HTMLElement>();

	/**
	 * drifts a row for as long as it may, carrying on from wherever it was scrolled to by hand, and
	 * leaving it scrolled to wherever it had drifted to once it may not
	 */
	function drift(index: number) {
		return (row: HTMLElement) => {
			const track = row.firstElementChild as HTMLElement;
			const [list, copy] = track.children as unknown as HTMLElement[];
			const reverse = index % 2 === 1;

			/**
			 * how far a row that stands still is scrolled to look as it would drifting: past the room
			 * left before its first, so the keyboard can bring that clear of where the row fades out,
			 * and for every other row half of one more, so they do not line up in columns, which is
			 * by its margin as it drifts
			 */
			const shift = () =>
				row.clientWidth * FADE +
				(reverse
					? ((list.firstElementChild as HTMLElement).offsetWidth +
							parseFloat(getComputedStyle(list).columnGap)) /
						2
					: 0);

			if (!moving || focused === index) {
				row.classList.add('still');

				// as the page arrives, before anything else has scrolled it
				if (!placed.has(row)) row.scrollLeft = shift();
				placed.add(row);
				return;
			}

			placed.add(row);
			cancelAnimationFrame(glides.get(row) ?? 0);

			const duration = rows[index].length * PACE * PACES[index % PACES.length];

			/** how far it goes before the copy is where the list was, and it starts again unseen */
			const lap = () => copy.offsetLeft - list.offsetLeft;

			const animation = track.animate(
				[{ translate: '0' }, { translate: 'calc(-50% - var(--gap) / 2)' }],
				{ duration, iterations: Infinity, direction: reverse ? 'reverse' : 'normal' }
			);

			// many laps in, so a hand can take it back as far as it likes without it running out
			const was = row.classList.contains('still') ? row.scrollLeft - shift() : 0;
			const from = (((was % lap()) + lap()) % lap()) / lap();
			animation.currentTime = (1000 + (reverse ? 1 - from : from)) * duration;

			row.classList.remove('still');
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
			/** the pointer that stopped it while it was still flying from a swipe */
			let caught: number | undefined;

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

				// a finger put down on one still flying from a swipe stops it there
				if (Math.abs(animation.playbackRate) > 3) {
					caught = event.pointerId;
					cancelAnimationFrame(settling);
					animation.pause();
				}
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
					caught = undefined;
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

				// stopped and let go without being moved, which drifts on from there, and is not a tap
				// on whatever happened to be passing
				if (caught === event.pointerId) {
					caught = undefined;
					dragged = true;
					settle(0);
					return;
				}

				if (!drag || event.pointerId !== drag.id) return;

				const first = drag.samples[0];
				const last = drag.samples[drag.samples.length - 1];
				drag = undefined;
				dragged = true;

				// thrown on by however fast it was going as it was let go, in pixels a millisecond,
				// or left where it is if the finger had stopped first. no faster than can be followed
				const fresh = last && event.timeStamp - last.t < 80;
				const velocity = fresh ? (last.x - first.x) / Math.max(last.t - first.t, 1) : 0;

				settle(-Math.max(-3, Math.min(3, velocity)) * pace());
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
				row.classList.add('still');
				row.scrollLeft = (reverse ? lap() - at : at) + shift();

				// and to what the keyboard has reached, which may have been out of the window
				reveal(row);
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
			style:grid-row={index + 1}
			onpointerenter={(event) => event.pointerType === 'mouse' && (pointed = index)}
			onpointerleave={() => pointed === index && (pointed = -1)}
			onfocusin={(event) => enter(event, index)}
			onkeydown={keys}
			onfocusout={(event) =>
				!event.currentTarget.contains(event.relatedTarget as Node | null) &&
				focused === index &&
				(focused = -1)}
			{@attach drift(index)}
		>
			<div class="track">
				<ul>
					{#each row as site, i (site.id)}
						<li id={site.id}>{@render tile(site, false, i !== (stops[index] ?? 0))}</li>
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

	<!-- how to get about the rows, over the top edge of whichever one the keyboard is in -->
	<p id="{uid}-keys" class="keys" class:shown={focused !== -1} style:grid-row={focused + 1 || 1}>
		<kbd aria-hidden="true">←</kbd>
		<kbd aria-hidden="true">↑</kbd>
		<kbd aria-hidden="true">↓</kbd>
		<kbd aria-hidden="true">→</kbd>
		<span class="visually-hidden">Arrow keys</span>
		for more sites
	</p>
</div>

{#snippet tile(site: Site, copy = false, passed = false)}
	<Tile
		{site}
		sizes="(min-width: 64em) 18vw, (min-width: 40em) 28vw, 39vw"
		compact
		still
		{copy}
		{passed}
		describedby={copy || passed ? undefined : `${uid}-keys`}
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
		grid-column: 1;
		overflow-x: auto;
		/* each row rather than all of them together, which would cut off what says how the keyboard
		   gets along a row where it sits over the top of the first */
		mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);
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

		/* scrolled that far instead where it stands still, past room before its first as wide as
		   the row fades out over, which the keyboard can then bring clear of it */
		&:global(.still) .track {
			margin-left: 0;
			padding-left: 15%;
		}
	}

	/* across the top edge of the row it is about, in the gap above it, so it covers next to
	   nothing of the one with focus, nor its name at the foot of it */
	.keys {
		grid-column: 1;
		z-index: 2;
		place-self: start center;
		translate: 0 -50%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
		padding: 0.5rem 1.2rem;
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-1);
		background: var(--sk-bg-2);
		border: 1px solid var(--sk-border);
		border-radius: 10rem;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s ease;

		&.shown {
			opacity: 1;
		}

		kbd {
			padding: 0 0.6rem;
			font-size: 1em;
			line-height: 1.5;
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
