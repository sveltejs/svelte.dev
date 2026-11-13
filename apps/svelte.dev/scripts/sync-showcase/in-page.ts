// functions that run in the page being captured, so each must use nothing from outside itself

export type Scrolled = Window & { showcase_scroller?: HTMLElement };

/** runs in the page with plain loops, since some pages replace builtins like Array.from */
export function detect(): 'svelte' | 'sveltekit' | null {
	if (document.querySelector('#svelte-announcer')) return 'sveltekit';

	for (const key in window) {
		if (key.startsWith('__sveltekit_')) return 'sveltekit';
	}

	let svelte =
		// @ts-expect-error added by Svelte 4 and later
		window.__svelte?.v?.size > 0 ||
		document.querySelector('[data-svelte-h], astro-island[renderer-url*="svelte"]') !== null;

	for (const element of document.querySelectorAll('*')) {
		for (const name of element.getAttributeNames()) {
			if (name.startsWith('data-sveltekit-')) return 'sveltekit';
		}

		if (/(^|\s)svelte-[a-z0-9]{4,}(\s|$)/.test(element.getAttribute('class') ?? '')) {
			svelte = true;
		}
	}

	return svelte ? 'svelte' : null;
}

/** runs in the page, waits up to ten seconds for animations that end so none is caught halfway */
export function finish_animations() {
	const finishing = document
		.getAnimations()
		.filter(
			(animation) =>
				animation.playState === 'running' &&
				animation.effect?.getComputedTiming().endTime !== Infinity
		)
		.map((animation) => animation.finished);

	return Promise.race([
		Promise.allSettled(finishing).then(() => {}),
		new Promise<void>((resolve) => setTimeout(resolve, 10_000))
	]);
}

/**
 * runs in the page, finds where to end a page cut short: the lowest line well down the given height
 * that cuts through the fewest images and words, so it ends between things rather than through one
 */
export function section_end(max: number) {
	const scroller = (window as Scrolled).showcase_scroller ?? document.documentElement;
	if (scroller !== document.documentElement) return max;

	const things = [
		...document.querySelectorAll('img, video, picture, svg, canvas, h1, h2, h3, h4, p, li, button')
	]
		.map((element) => element.getBoundingClientRect())
		.filter((box) => box.width > 0 && box.height > 0)
		.map((box) => ({ top: box.top + scrollY, bottom: box.bottom + scrollY }));

	let best = { at: max, cuts: Infinity };
	for (const { bottom } of things) {
		const at = Math.ceil(bottom) + 1;
		if (at > max || at < max * 0.6) continue;

		const cuts = things.filter((thing) => thing.top < at - 1 && thing.bottom > at + 1).length;
		if (cuts < best.cuts || (cuts === best.cuts && at > best.at)) best = { at, cuts };
	}

	return best.at;
}

/**
 * runs in the page, finds what scrolls, which is the page itself unless it stays the height of the
 * window and an app in it scrolls instead, and returns how tall that is
 */
export function mark_scroller() {
	let scroller = document.documentElement;

	if (scroller.scrollHeight <= innerHeight + 50) {
		for (const element of document.querySelectorAll<HTMLElement>('body *')) {
			const { overflowY } = getComputedStyle(element);
			const { width } = element.getBoundingClientRect();
			if (!/auto|scroll/.test(overflowY) || width < innerWidth * 0.5) continue;
			if (element.scrollHeight > scroller.scrollHeight) scroller = element;
		}
	}

	(window as Scrolled).showcase_scroller = scroller;
	return scroller === document.documentElement
		? scroller.scrollHeight
		: scroller.scrollHeight + scroller.getBoundingClientRect().top;
}

/**
 * runs in the page, hides popups that cover the page, such as a sign up form over a dimmed page. a
 * background that fills the window sits under the page instead, so it is kept
 */
export function hide_popups() {
	for (const element of document.querySelectorAll<HTMLElement>('body *')) {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();

		const covering =
			style.position === 'fixed' &&
			box.width >= innerWidth * 0.9 &&
			box.height >= innerHeight * 0.9 &&
			Number(style.zIndex) >= 10;

		if (covering || element.matches('dialog[open], [aria-modal="true"]')) {
			element.style.setProperty('display', 'none', 'important');
		}
	}
}

/** runs in the page, hides what stays in the window as it scrolls, other than sticky parts of the page */
export function hide_fixed() {
	for (const element of document.querySelectorAll<HTMLElement>('body *')) {
		const { position } = getComputedStyle(element);
		if (position !== 'fixed' && position !== 'sticky') continue;
		if (position === 'sticky' && element.getBoundingClientRect().top > 150) continue;

		// at once, rather than fading out as the screenshot is taken
		element.style.setProperty('transition', 'none', 'important');
		element.style.setProperty('opacity', '0', 'important');
	}
}

/** runs in the page, pauses its videos the given number of seconds in */
export function pause_videos(seconds: number) {
	const seeking = [...document.querySelectorAll('video')].map(
		(video) =>
			new Promise<void>((resolve) => {
				video.pause();
				video.addEventListener('seeked', () => resolve(), { once: true });
				setTimeout(resolve, 5000);
				video.currentTime = seconds;
			})
	);

	return Promise.all(seeking).then(() => {});
}
