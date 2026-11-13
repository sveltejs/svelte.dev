/** set while a jump replays its click, so the browser and the router handle it as usual */
let replaying = false;

/** the frame of a site's screenshot in the list, which is in the element with its id */
function frame_of(id: string) {
	return document.getElementById(id)?.querySelector<HTMLElement>('.frame');
}

/** starts loading the screenshot of a site in the list before jumping to it */
export function prime(id: string) {
	const image = frame_of(id)?.querySelector('img');
	if (image) image.loading = 'eager';
}

/** moves the screenshot you clicked onto the same one in the list as the page jumps there */
export function morph(event: MouseEvent, id: string) {
	const link = event.currentTarget as HTMLAnchorElement;
	const source = link.querySelector<HTMLElement>('.frame');
	const destination = frame_of(id);

	if (
		replaying ||
		!source ||
		!destination ||
		!document.startViewTransition ||
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey ||
		// a keyboard press, which should never wait on motion
		event.detail === 0 ||
		matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		return;
	}

	event.preventDefault();

	jump(source, destination, () => {
		replaying = true;
		link.click();
		replaying = false;
	});
}

/**
 * the same move for the back and forward buttons: forward again to a site in the list, from its
 * card at the front of the carousel, and back from it to that card. only where both are there to
 * be seen, and otherwise the page jumps as it would have
 */
export function morph_history() {
	let url = new URL(location.href);

	/**
	 * where the page was scrolled to before the move, as of the last time it said it scrolled,
	 * since safari has already scrolled to a site in the list by the time it says it went forward
	 */
	let scroll = { left: scrollX, top: scrollY };

	const controller = new AbortController();
	const { signal } = controller;

	addEventListener('scroll', () => (scroll = { left: scrollX, top: scrollY }), {
		passive: true,
		signal
	});

	// follows every change of place, by a link or through history, and after the move below
	addEventListener('hashchange', () => (url = new URL(location.href)), { signal });

	function traverse(event: PopStateEvent) {
		const was = url;
		url = new URL(location.href);

		const before = scroll;
		const after = { left: scrollX, top: scrollY };

		if (
			// a link to somewhere on the page, which says so too, and not a move through history
			event.state === null ||
			// the browser showed the move itself, as safari does for a swipe from the edge
			event.hasUAVisualTransition ||
			!document.startViewTransition ||
			matchMedia('(prefers-reduced-motion: reduce)').matches ||
			was.pathname !== url.pathname ||
			was.search !== url.search ||
			// between the start of the page and a site in the list only
			!was.hash === !url.hash ||
			Math.abs(after.top - before.top) < 1
		) {
			return;
		}

		const id = decodeURIComponent((url.hash || was.hash).slice(1));
		const card = document.querySelector<HTMLElement>(
			`.card.front[href="#${CSS.escape(id)}"] .frame`
		);
		const listed = frame_of(id);
		if (!card || !listed) return;

		const [source, destination] = url.hash ? [card, listed] : [listed, card];

		// back to where it was for the browser to capture, before anything is painted
		scrollTo({ ...before, behavior: 'instant' });

		const { top, bottom } = source.getBoundingClientRect();

		if (bottom <= 0 || top >= innerHeight) {
			scrollTo({ ...after, behavior: 'instant' });
			return;
		}

		jump(source, destination, () => scrollTo({ ...after, behavior: 'instant' }));
	}

	// listening only once the router is, which starts after the page it loads with is on screen,
	// so the router has scrolled the page to where it goes by the time this hears of the move.
	// were this to hear first, the page would not have moved yet, and it jumps as it would have
	const listening = setTimeout(() => addEventListener('popstate', traverse, { signal }));

	return () => {
		clearTimeout(listening);
		controller.abort();
	};
}

/** moves one screenshot onto the other as the page changes from showing one to showing the other */
async function jump(source: HTMLElement, destination: HTMLElement, change: () => void) {
	// the rest of the category loads too, so it does not land among empty frames
	for (const img of destination.closest('ul')?.querySelectorAll('img') ?? []) {
		img.loading = 'eager';
	}

	// starts at once rather than waiting for the screenshot it lands on, which shows its blurred
	// placeholder until then
	const root = document.documentElement;
	let duration = 300;
	let to!: DOMRect;
	let stand_in: HTMLElement | undefined;

	// back to the top of a screenshot scrolling on hover, which is where it lands
	const scrolled = [...source.querySelectorAll<HTMLElement>('.slide, .slide > .image')];
	for (const el of scrolled) {
		el.style.transition = 'none';
		el.style.translate = '0 0';
	}

	// and to the screenshot from a clip playing over it
	const clip = source.querySelector<HTMLVideoElement>('.clip');
	if (clip) {
		clip.pause();
		clip.style.transition = 'none';
		clip.style.opacity = '0';
	}

	// where it starts from, as the browser captures it, since starting from wherever the browser's
	// own animation of it happens to be leaves it starting at the end when that is not yet running
	const from = source.getBoundingClientRect();

	source.style.viewTransitionName = 'picked';
	root.classList.add('picking');

	const transition = document.startViewTransition(() => {
		source.style.viewTransitionName = '';

		change();

		to = destination.getBoundingClientRect();
		stand_in = stand_in_for(destination, source, to);

		// longer the further it has to go, so a long way is not too quick to follow
		duration = Math.min(450, 300 + Math.hypot(to.left - from.left, to.top - from.top) / 4);

		// shows under the picked one as it lands, which then fades, so the two never dim each other
		destination.animate(
			[{ opacity: 0 }, { opacity: 0, offset: 0.85 }, { opacity: 1, offset: 0.95 }],
			duration
		);
	});

	transition.finished.finally(() => {
		root.classList.remove('picking');
		stand_in?.remove();
		for (const el of scrolled) {
			el.style.transition = el.style.translate = '';
		}
		// and the clip stopped and back at its start, for next time
		if (clip) {
			clip.style.transition = clip.style.opacity = '';
			delete source.dataset.playing;
			clip.currentTime = 0;
		}
	});

	try {
		await transition.ready;
	} catch {
		return;
	}

	// safari also leaves an element the page scrolls to where it is, so only the picked one is
	// captured, and travels to where the one in the list is
	root.animate(
		{
			transform: [
				`translate(${from.left}px, ${from.top}px)`,
				`translate(${to.left}px, ${to.top}px)`
			],
			width: [`${from.width}px`, `${to.width}px`],
			height: [`${from.height}px`, `${to.height}px`]
		},
		{
			duration,
			// off gently and in gently, as what moves across the screen does
			easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
			fill: 'both',
			pseudoElement: '::view-transition-group(picked)'
		}
	);

	root.animate(
		// out early, before the card grows past it, so its edge and shadow never show through
		{ opacity: [1, 0] },
		{ duration: duration * 0.3, fill: 'both', pseudoElement: '::view-transition-old(picked)' }
	);
}

/**
 * a copy of the screenshot in the list, held where it is in the window, which the picked one
 * travels to. a copy rather than the one in the list, since safari leaves an element the page
 * scrolls to where it was
 */
function stand_in_for(destination: HTMLElement, source: HTMLElement, to: DOMRect) {
	const style = getComputedStyle(destination);
	// whichever has loaded, since both are the same top of the screenshot, so it never turns from
	// sharp to blurred on the way
	const image = [destination.querySelector('img'), source.querySelector('img')].find(
		(img) => img?.complete && img.naturalWidth > 0
	);

	const stand_in = document.createElement('div');
	Object.assign(stand_in.style, {
		position: 'fixed',
		left: `${to.left}px`,
		top: `${to.top}px`,
		width: `${to.width}px`,
		height: `${to.height}px`,
		overflow: 'hidden',
		borderRadius: style.borderRadius,
		background: style.background,
		pointerEvents: 'none',
		viewTransitionName: 'picked'
	});

	if (image?.currentSrc) {
		const copy = new Image();
		copy.src = image.currentSrc;
		Object.assign(copy.style, {
			width: '100%',
			height: '100%',
			objectFit: 'cover',
			objectPosition: getComputedStyle(image).objectPosition
		});
		stand_in.append(copy);

		// and behind the one in the list until its own loads, so it does not turn blurred on landing
		if (!destination.contains(image)) {
			destination.style.setProperty('--placeholder', `url("${image.currentSrc}")`);
		}
	}

	document.body.append(stand_in);
	return stand_in;
}
