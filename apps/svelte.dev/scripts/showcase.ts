/**
 * checks each showcase site still uses svelte and updates its screenshot, which is only
 * saved when svelte is found so a failing site keeps its old one
 *
 * ads, cookie banners and popups are blocked with ad blocker filter lists, add a selector
 * to screenshot.hide on the site for anything they miss
 *
 * sites with screenshot.headed block headless browsers and only run with --headed, which
 * opens a window, gives you two minutes per site to pass any checks and waits for enter
 * before each screenshot, so run it on your own machine
 *
 * needs a playwright browser, pnpm exec playwright install chromium
 *
 * @example
 * pnpm showcase                # every site
 * pnpm showcase immich crates  # only these sites, by id
 * pnpm showcase --missing      # only sites without a screenshot
 * pnpm showcase --check        # check without taking screenshots
 * pnpm showcase --headed       # sites that block headless browsers
 * pnpm showcase --clip         # record the clips of sites with one, which needs ffmpeg
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { parseArgs } from 'node:util';
import {
	adsAndTrackingLists,
	adsLists,
	fullLists,
	PlaywrightBlocker
} from '@ghostery/adblocker-playwright';
import { chromium, type Browser, type Page } from 'playwright';
import { arrange } from '../src/routes/showcase/arrange.ts';
import { categories, sites, type Site } from '../src/routes/showcase/sites.ts';

const SCREENSHOTS = path.resolve(import.meta.dirname, '../src/routes/showcase/screenshots');
const CLIPS = path.resolve(import.meta.dirname, '../src/routes/showcase/clips');
const EXTENSIONS = ['jpg', 'png', 'webp'];
const VIEWPORT = { width: 1440, height: 900 };

// taller than the window, since the first site in each category is shown taller than 1440x900
const SIZE = { width: 1440, height: 1440 };

// as far down a long page as the screenshot goes, for the grid to scroll down on hover
const MAX_HEIGHT = 2400;

// the ones shown wider than half the page, taken at twice the size to stay sharp on high density
// screens
const WIDE = new Set(
	categories.flatMap((category) =>
		arrange(sites.filter((site) => site.category === category.id))
			.filter((cell) => ['beside', 'large'].includes(cell.kind))
			.map((cell) => cell.site.id)
	)
);

// tracker lists are left out since blocking trackers breaks some sites, windy thinks it is offline
const FILTER_LISTS = [
	...adsLists,
	...fullLists.filter((list) => !adsAndTrackingLists.includes(list)),
	'https://easylist.to/easylist/fanboy-annoyance.txt'
];

// cookie banners the lists miss, such as on gov.uk, but never anything holding the main content
const COOKIE_BANNERS = `:is(
	[aria-label*="cookie" i][role="region"],
	[aria-label*="cookie" i][role="dialog"],
	[class*="cookie-banner" i], [id*="cookie-banner" i],
	[class*="cookies-banner" i], [id*="cookies-banner" i],
	[class*="cookie-consent" i], [id*="cookie-consent" i]
):not(html, body, :has(main, h1))`;

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		check: { type: 'boolean', default: false },
		missing: { type: 'boolean', default: false },
		headed: { type: 'boolean', default: false },
		clip: { type: 'boolean', default: false }
	}
});

const unknown = positionals.filter((id) => !sites.some((site) => site.id === id));
if (unknown.length > 0) {
	console.error(`Unknown site: ${unknown.join(', ')}`);
	process.exit(1);
}

const candidates = sites.filter(
	(site) =>
		(positionals.length === 0 || positionals.includes(site.id)) &&
		(!values.clip || site.clip !== undefined) &&
		(!values.missing || !find_screenshot(site.id))
);

// named sites always run, otherwise --headed picks the sites that need it
const selected = candidates.filter(
	(site) => positionals.length > 0 || (site.screenshot?.headed ?? false) === values.headed
);
const skipped = candidates.filter((site) => !selected.includes(site));

fs.mkdirSync(SCREENSHOTS, { recursive: true });
fs.mkdirSync(CLIPS, { recursive: true });

const blocker = await PlaywrightBlocker.fromLists(fetch, FILTER_LISTS);
const browser = await chromium.launch({ headless: !values.headed });
const problems: string[] = [];

let next = 0;
await Promise.all(
	// one at a time when headed so there is only one window to deal with
	Array.from({ length: values.headed ? 1 : 4 }, async () => {
		while (next < selected.length) {
			const site = selected[next++];
			const problem = await visit(browser, site);

			if (problem) problems.push(`${site.id}: ${problem}`);
			console.log(`${problem ? '✗' : '✓'} ${site.id}${problem ? ` — ${problem}` : ''}`);
		}
	})
);

await browser.close();

if (skipped.length > 0 && !values.headed) {
	console.log(
		`\nSkipped ${skipped.map((site) => site.id).join(', ')}, which block headless browsers. Check them with \`pnpm showcase --headed\``
	);
}

if (problems.length > 0) {
	console.log(`\n${problems.length} of ${selected.length} sites need attention:`);
	for (const problem of problems) console.log(`  ${problem}`);
	process.exit(1);
}

async function visit(browser: Browser, site: Site) {
	const scale = WIDE.has(site.id) ? 2 : 1;

	const context = await browser.newContext({
		viewport: VIEWPORT,
		deviceScaleFactor: values.clip ? 1 : scale,
		locale: 'en-US',
		// the clips are there for the motion
		reducedMotion: values.clip ? 'no-preference' : 'reduce'
	});

	try {
		const page = await context.newPage();
		await blocker.enableBlockingInPage(page);

		const response = await page.goto(site.screenshot?.url ?? site.url, {
			waitUntil: 'load',
			timeout: 30_000
		});
		await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

		let found = await page.evaluate(detect).catch(() => null);

		if (!found && values.headed) {
			console.log(`  ${site.id}: waiting for Svelte, complete any checks in the browser window`);
			found = await wait_for_svelte(page);
		}

		if (!found) {
			return values.headed
				? 'no Svelte found after two minutes'
				: `no Svelte found (HTTP ${response?.status()}) — it may block headless browsers (try --headed), or no longer use Svelte`;
		}

		if (values.clip && site.clip) {
			await page.addStyleTag({
				content: `${[COOKIE_BANNERS, ...(site.screenshot?.hide ?? [])].join(', ')} { display: none !important; }`
			});
			await page.evaluate(hide_popups);
			if (values.headed && process.stdin.isTTY) {
				await prompt(`  ${site.id}: close anything covering the page, then press Enter to record `);
			}
			await record(
				page,
				site.id,
				site.clip === true ? {} : site.clip,
				WIDE.has(site.id),
				site.screenshot?.from_clip ?? false
			);
		} else if (!values.check && !site.screenshot?.from_clip) {
			await page.addStyleTag({
				content: `${[COOKIE_BANNERS, ...(site.screenshot?.hide ?? [])].join(', ')} { display: none !important; }`
			});

			await page.evaluate(finish_animations).catch(() => {});
			await page.waitForTimeout(site.screenshot?.delay ?? 1000);

			if (values.headed && process.stdin.isTTY) {
				await prompt(
					`  ${site.id}: close anything covering the page, then press Enter to take the screenshot `
				);
				await page.evaluate(() => scrollTo(0, 0));
			}

			const height = await extend(page, site.screenshot?.height ?? MAX_HEIGHT);

			if (site.screenshot?.video !== undefined) {
				await page.evaluate(pause_videos, site.screenshot.video);
				await page.waitForTimeout(250);
			}

			const file = path.join(SCREENSHOTS, `${site.id}${scale === 2 ? '@2x' : ''}.jpg`);
			await capture(page, height, file);

			for (const other of screenshot_files(site.id)) {
				if (other !== file) fs.rmSync(other, { force: true });
			}
		}
	} catch (error) {
		return (error as Error).message.split('\n')[0];
	} finally {
		await context.close();
	}
}

/** runs in the page with plain loops, since some pages replace builtins like Array.from */
function detect(): 'svelte' | 'sveltekit' | null {
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
function finish_animations() {
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
 * scrolls a tall page down and back so lazy content loads, or makes the window taller for an app,
 * and returns how much of the page to take. a short page is never stretched past SIZE, since an app
 * that fills the window would only gain empty space
 */
async function extend(page: Page, max: number) {
	const scrolls = await page.evaluate(() => document.documentElement.scrollHeight);
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
			await page.evaluate((y) => scrollTo(0, y), Math.min(y, height - VIEWPORT.height));
			await page.waitForTimeout(400);
		}
		await page.evaluate(() => scrollTo(0, 0));
	} else {
		await page.setViewportSize(SIZE);
	}

	// lets what that set off play out, such as a header that fades back in at the top
	await page.waitForTimeout(1000);
	await page.evaluate(finish_animations).catch(() => {});
	await page.waitForTimeout(1500);
	return Math.max(height, SIZE.height);
}

/**
 * takes a tall page a window at a time and stitches them together, since some sites only show what
 * is in the window, so a screenshot of the whole page at once leaves the rest blank
 */
async function capture(page: Page, height: number, file: string) {
	if (height <= (page.viewportSize()?.height ?? 0)) {
		await page.evaluate(hide_popups);
		await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
		return;
	}

	const tiles: Array<{ top: number; data: string }> = [];

	for (let y = 0; y < height; y += VIEWPORT.height) {
		const top = await page.evaluate(
			(y) => {
				document.documentElement.style.scrollBehavior = 'auto';
				scrollTo(0, y);
				return scrollY;
			},
			Math.min(y, height - VIEWPORT.height)
		);

		// lets what scrolling into view set off play out
		await page.waitForTimeout(1000);
		await page.evaluate(finish_animations).catch(() => {});
		await page.waitForTimeout(500);

		// popups can open at any point while waiting, and what stays in the window, such as headers
		// and backgrounds, would show again in every window
		await page.evaluate(hide_popups);
		if (top > 0) await page.evaluate(hide_fixed);

		const buffer = await page.screenshot({ type: 'png' });
		tiles.push({ top, data: buffer.toString('base64') });
	}

	// stitched in a page of its own, at the same density as the screenshots
	const stitch = await page.context().newPage();

	try {
		await stitch.setViewportSize({ width: SIZE.width, height });
		await stitch.setContent(
			`<body style="margin:0">${tiles
				.map(
					(tile) =>
						`<img src="data:image/png;base64,${tile.data}" style="position:absolute;left:0;top:${tile.top}px;width:${VIEWPORT.width}px;height:${VIEWPORT.height}px">`
				)
				.join('')}</body>`,
			{ waitUntil: 'load' }
		);
		await stitch.screenshot({ path: file, type: 'jpeg', quality: 85 });
	} finally {
		await stitch.close();
	}
}

/**
 * runs in the page, hides popups that cover the page, such as a sign up form over a dimmed page. a
 * background that fills the window sits under the page instead, so it is kept
 */
function hide_popups() {
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
function hide_fixed() {
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
function pause_videos(seconds: number) {
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

/**
 * records the window for a few seconds, moving the pointer across anything named in turn, and saves
 * it as h.264, which every browser plays, muted and the size of the card it plays in
 */
async function record(
	page: Page,
	id: string,
	{ scroll, hover, length = 8 }: Exclude<Site['clip'], true | undefined>,
	wide: boolean,
	still: boolean
) {
	// the shape of the card, 6:5 for the large ones and 16:10 for the rest
	const size = wide ? { width: 1440, height: 1200 } : VIEWPORT;
	const output = wide ? { width: 1200, height: 1000 } : { width: 960, height: 600 };
	await page.setViewportSize(size);

	if (scroll) {
		await page.locator(scroll).first().scrollIntoViewIfNeeded();
		await page.evaluate((selector) => {
			document.querySelector(selector)?.scrollIntoView({ block: 'center' });
		}, scroll);
	}

	// for videos to start and anything the page plays as it loads to settle
	await page.mouse.move(size.width - 1, size.height - 1);
	await page.waitForTimeout(2000);

	const frames = fs.mkdtempSync(path.join(os.tmpdir(), `showcase-${id}-`));
	const cdp = await page.context().newCDPSession(page);
	const times: number[] = [];

	cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
		fs.writeFileSync(path.join(frames, `${times.length}.jpg`), Buffer.from(data, 'base64'));
		times.push(metadata.timestamp ?? Date.now() / 1000);
		await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
	});

	await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });

	const targets = [];
	for (const target of hover ? await page.locator(hover).all() : []) {
		if (await target.isVisible()) targets.push(target);
	}

	if (targets.length > 0) {
		const dwell = (length * 1000) / targets.length;
		for (const target of targets) {
			const box = await target.boundingBox();
			if (box) {
				await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
			}
			await page.waitForTimeout(dwell);
		}
	} else {
		await page.waitForTimeout(length * 1000);
	}

	await cdp.send('Page.stopScreencast');
	await cdp.detach();

	if (times.length < 2) throw new Error('no frames recorded');

	// as its screenshot, for a site that differs on every visit
	if (still) {
		for (const other of screenshot_files(id)) fs.rmSync(other, { force: true });
		fs.copyFileSync(path.join(frames, '0.jpg'), path.join(SCREENSHOTS, `${id}.jpg`));
	}

	// each frame shown until the next, since the browser only sends one when something changes
	const list = times
		.map((time, i) => {
			const until = times[i + 1] ?? times[0] + length;
			return `file '${path.join(frames, `${i}.jpg`)}'\nduration ${Math.max(until - time, 0.001)}`;
		})
		.join('\n');
	fs.writeFileSync(
		path.join(frames, 'list.txt'),
		`${list}\nfile '${path.join(frames, `${times.length - 1}.jpg`)}'\n`
	);

	execFileSync('ffmpeg', [
		...['-y', '-loglevel', 'error'],
		...['-f', 'concat', '-safe', '0', '-i', path.join(frames, 'list.txt')],
		...['-vf', `fps=30,scale=${output.width}:${output.height}:flags=lanczos,format=yuv420p`],
		...['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-profile:v', 'high'],
		...['-movflags', '+faststart', path.join(CLIPS, `${id}.mp4`)]
	]);

	fs.rmSync(frames, { recursive: true, force: true });
}

/** checks every second for two minutes, including after redirects */
async function wait_for_svelte(page: Page) {
	const deadline = Date.now() + 120_000;

	while (Date.now() < deadline) {
		await page.waitForTimeout(1000);
		const found = await page.evaluate(detect).catch(() => null);

		if (found) {
			await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
			return found;
		}
	}

	return null;
}

async function prompt(message: string) {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	await rl.question(message);
	rl.close();
}

function find_screenshot(id: string) {
	return screenshot_files(id).some((file) => fs.existsSync(file));
}

/** every file the screenshot of a site could be, with @2x on the ones taken at twice the size */
function screenshot_files(id: string) {
	return [id, `${id}@2x`].flatMap((name) =>
		EXTENSIONS.map((extension) => path.join(SCREENSHOTS, `${name}.${extension}`))
	);
}
