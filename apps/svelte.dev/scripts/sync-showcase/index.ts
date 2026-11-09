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
 * pnpm sync-showcase                # every site
 * pnpm sync-showcase immich crates  # only these sites, by id
 * pnpm sync-showcase --missing      # only sites without a screenshot
 * pnpm sync-showcase --check        # check without taking screenshots
 * pnpm sync-showcase --headed       # sites that block headless browsers
 * pnpm sync-showcase --clip         # record the clips of sites with one, which needs ffmpeg
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
import { arrange } from '../../src/routes/showcase/arrange.ts';
import { categories, sites, type Site } from '../../src/routes/showcase/sites.ts';
import { capture, extend } from './capture.ts';
import { detect, finish_animations, hide_popups, pause_videos } from './in-page.ts';
import { record } from './record.ts';
import { CLIPS, SCREENSHOTS, VIEWPORT, find_screenshot, screenshot_files } from './shared.ts';

// as far down a long page as the screenshot goes, for the grid to scroll down on hover
const MAX_HEIGHT = 2400;

// the big one in each category, taken at twice the size to stay sharp on high density screens
const WIDE = new Set(
	categories.flatMap((category) =>
		arrange(
			sites.filter((site) => site.category === category.id && !site.more),
			(site) => site.clip !== undefined
		)
			.filter((tile) => tile.size === 'big')
			.map((tile) => tile.site.id)
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
// clips in chrome where it is installed, since playwright's own chromium can't play the h.264 video
// many sites use, so their videos stay still
const browser = await (values.clip
	? chromium
			.launch({ headless: !values.headed, channel: 'chrome' })
			.catch(() => chromium.launch({ headless: !values.headed }))
	: chromium.launch({ headless: !values.headed }));
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
		`\nSkipped ${skipped.map((site) => site.id).join(', ')}, which block headless browsers. Check them with \`pnpm sync-showcase --headed\``
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

		const hidden = `${[COOKIE_BANNERS, ...(site.screenshot?.hide ?? [])].join(', ')} { display: none !important; }`;

		if (values.clip && site.clip) {
			await page.addStyleTag({ content: hidden });
			await page.evaluate(hide_popups);
			if (values.headed && process.stdin.isTTY) {
				await prompt(
					`  ${site.id}: close anything covering the page and start anything that only plays when clicked, then press Enter to record `
				);
			}
			await record(
				page,
				site.id,
				site.clip === true ? {} : site.clip,
				WIDE.has(site.id),
				site.screenshot?.from_clip ?? false,
				hidden
			);
		} else if (!values.check && !site.screenshot?.from_clip) {
			await page.addStyleTag({ content: hidden });

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
		// already closed where the page closed itself, which is no failure of the site's
		await context.close().catch(() => {});
	}
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
