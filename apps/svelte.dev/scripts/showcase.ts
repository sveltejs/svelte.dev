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
 */
import fs from 'node:fs';
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
import { sites, type Site } from '../src/routes/showcase/sites.ts';

const SCREENSHOTS = path.resolve(import.meta.dirname, '../src/routes/showcase/screenshots');
const EXTENSIONS = ['jpg', 'png', 'webp'];
const VIEWPORT = { width: 1440, height: 900 };

// taller than the window, since the first site in each category is shown taller than 1440x900
const SIZE = { width: 1440, height: 1440 };

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
		headed: { type: 'boolean', default: false }
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
		(!values.missing || !find_screenshot(site.id))
);

// named sites always run, otherwise --headed picks the sites that need it
const selected = candidates.filter(
	(site) => positionals.length > 0 || (site.screenshot?.headed ?? false) === values.headed
);
const skipped = candidates.filter((site) => !selected.includes(site));

fs.mkdirSync(SCREENSHOTS, { recursive: true });

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
	const context = await browser.newContext({
		viewport: VIEWPORT,
		locale: 'en-US',
		reducedMotion: 'reduce'
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

		if (!values.check) {
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

			await extend(page);

			if (site.screenshot?.video !== undefined) {
				await page.evaluate(pause_videos, site.screenshot.video);
				await page.waitForTimeout(250);
			}

			const file = path.join(SCREENSHOTS, `${site.id}.jpg`);
			await page.screenshot({
				path: file,
				type: 'jpeg',
				quality: 85,
				fullPage: true,
				clip: { x: 0, y: 0, ...SIZE }
			});

			for (const extension of EXTENSIONS.filter((extension) => extension !== 'jpg')) {
				fs.rmSync(path.join(SCREENSHOTS, `${site.id}.${extension}`), { force: true });
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

/** scrolls a tall page down and back so lazy content loads, or makes the window taller for an app */
async function extend(page: Page) {
	const tall = await page.evaluate(
		(height) => document.documentElement.scrollHeight >= height,
		SIZE.height
	);

	if (tall) {
		await page.evaluate((y) => scrollTo(0, y), SIZE.height - VIEWPORT.height);
		await page.waitForTimeout(1000);
		await page.evaluate(() => scrollTo(0, 0));
	} else {
		await page.setViewportSize(SIZE);
	}

	await page.waitForTimeout(1000);
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
	return EXTENSIONS.some((extension) =>
		fs.existsSync(path.join(SCREENSHOTS, `${id}.${extension}`))
	);
}
