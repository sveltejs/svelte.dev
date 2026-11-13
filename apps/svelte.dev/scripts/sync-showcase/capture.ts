import type { Page } from 'playwright';
import {
	finish_animations,
	hide_fixed,
	hide_popups,
	mark_scroller,
	section_end,
	type Scrolled
} from './in-page.ts';
import { SIZE, VIEWPORT } from './shared.ts';

/**
 * scrolls a tall page down and back so lazy content loads, or makes the window taller for an app,
 * and returns how much of the page to take. a short page is never stretched past SIZE, since an app
 * that fills the window would only gain empty space
 */
export async function extend(page: Page, max: number) {
	const scrolls = await page.evaluate(mark_scroller);
	const height = Math.min(scrolls, max);

	// as much as a site says to take, such as one that only changes as it scrolls
	if (max < SIZE.height) {
		await page.waitForTimeout(1000);
		return height;
	}

	if (height >= SIZE.height) {
		// half a window at a time, so everything that appears as it scrolls into view does
		const step = VIEWPORT.height / 2;
		for (let y = step; y < height - VIEWPORT.height + step; y += step) {
			await page.evaluate(
				(y) => ((window as Scrolled).showcase_scroller ?? document.documentElement).scrollTo(0, y),
				Math.min(y, height - VIEWPORT.height)
			);
			await page.waitForTimeout(400);
		}
		await page.evaluate(() =>
			((window as Scrolled).showcase_scroller ?? document.documentElement).scrollTo(0, 0)
		);
	} else {
		await page.setViewportSize(SIZE);
	}

	// lets what that set off play out, such as a header that fades back in at the top
	await page.waitForTimeout(1000);
	await page.evaluate(finish_animations).catch(() => {});
	await page.waitForTimeout(1500);

	// a page longer than is taken ends after the last whole section that fits, rather than partway
	// through one
	const cut = scrolls > max ? await page.evaluate(section_end, max) : height;
	return Math.max(cut, SIZE.height);
}

/**
 * takes a tall page a window at a time and stitches them together, since some sites only show what
 * is in the window, so a screenshot of the whole page at once leaves the rest blank
 */
export async function capture(page: Page, height: number, file: string) {
	if (height <= (page.viewportSize()?.height ?? 0)) {
		await page.evaluate(hide_popups);
		await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
		return;
	}

	const tiles: Array<{
		top: number;
		data: string;
		clip: { x: number; y: number; width: number; height: number };
	}> = [];

	// a window at a time, or as much as shows of what scrolls when that is an app in the page
	for (let y = 0; ; ) {
		const { top, box } = await page.evaluate((y) => {
			const scroller = (window as Scrolled).showcase_scroller ?? document.documentElement;
			scroller.style.scrollBehavior = 'auto';
			scroller.scrollTo(0, y);
			const { x, y: from, width, height } = scroller.getBoundingClientRect();
			return {
				top: scroller.scrollTop,
				box:
					scroller === document.documentElement
						? { x: 0, y: 0, width: innerWidth, height: innerHeight }
						: { x, y: from, width, height }
			};
		}, y);

		// lets what scrolling into view set off play out
		await page.waitForTimeout(1000);
		await page.evaluate(finish_animations).catch(() => {});
		await page.waitForTimeout(500);

		// popups can open at any point while waiting, and what stays in the window, such as headers
		// and backgrounds, would show again in every window
		await page.evaluate(hide_popups);
		if (top > 0) await page.evaluate(hide_fixed);

		// below the first, only the part that scrolls, so what stays put around it shows once
		const clip = top > 0 ? box : { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height };
		const buffer = await page.screenshot({ type: 'png', clip });
		tiles.push({ top: top + clip.y * (top > 0 ? 1 : 0), data: buffer.toString('base64'), clip });

		const end = height - box.y - box.height;
		const next = Math.min(top + box.height, end);
		if (next <= top) break;
		y = next;
	}

	// stitched in a page of its own, at the same density as the screenshots
	const stitch = await page.context().newPage();

	try {
		await stitch.setViewportSize({ width: SIZE.width, height });
		await stitch.setContent(
			`<body style="margin:0">${tiles
				.map(
					(tile) =>
						`<img src="data:image/png;base64,${tile.data}" style="position:absolute;left:${tile.clip.x}px;top:${tile.top}px;width:${tile.clip.width}px;height:${tile.clip.height}px">`
				)
				.join('')}</body>`,
			{ waitUntil: 'load' }
		);
		// a moment to paint, or chrome sometimes fails to capture it
		await stitch.waitForTimeout(500);
		await stitch.screenshot({ path: file, type: 'jpeg', quality: 85 });
	} finally {
		await stitch.close();
	}
}
