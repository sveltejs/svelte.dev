/** set while a jump replays its click, so the browser and the router handle it as usual */
let replaying = false;

/** starts loading the screenshot of a site in the list before jumping to it */
export function prime(id: string) {
	const image = document.getElementById(id)?.querySelector('img');
	if (image) image.loading = 'eager';
}

/** moves the screenshot you clicked onto the same one in the list as the page jumps there */
export function morph(event: MouseEvent, id: string) {
	const link = event.currentTarget as HTMLAnchorElement;
	const source = link.querySelector<HTMLElement>('.face, .sheet');
	const destination = document.getElementById(id)?.querySelector<HTMLElement>('.thumb');

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
	jump(link, source, destination);
}

async function jump(link: HTMLAnchorElement, source: HTMLElement, destination: HTMLElement) {
	// the rest of the category loads too, so it does not land among empty frames
	for (const img of destination.closest('ul')?.querySelectorAll('img') ?? []) {
		img.loading = 'eager';
	}

	// starts at once rather than waiting for the screenshot it lands on, which shows its blurred
	// placeholder until then
	const root = document.documentElement;
	const duration = 300;
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

		replaying = true;
		link.click();
		replaying = false;

		to = destination.getBoundingClientRect();
		stand_in = stand_in_for(destination, source, to);

		// shows under the picked one as it lands, which then fades, so the two never dim each other
		destination.animate(
			[{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1, offset: 0.65 }],
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
			easing: getComputedStyle(root).getPropertyValue('--quint-out').trim(),
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
