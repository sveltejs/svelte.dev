import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Page } from 'playwright';
import type { Site } from '../../src/routes/showcase/sites.ts';
import { hide_popups } from './in-page.ts';
import { CLIPS, SCREENSHOTS, VIEWPORT, screenshot_files } from './shared.ts';

/** the height of the frames the browser sends of the page, which can be less than the window's */
async function frame_height(page: Page) {
	const cdp = await page.context().newCDPSession(page);
	const frame = new Promise<number>((resolve) => {
		cdp.once('Page.screencastFrame', ({ metadata }) => resolve(metadata.deviceHeight));
	});
	await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 10 });
	// something has to change for a frame to be sent
	await page.evaluate(() => document.documentElement.style.setProperty('--showcase-frame', '1'));
	const height = await Promise.race([frame, page.waitForTimeout(3000).then(() => Infinity)]);
	await cdp.send('Page.stopScreencast');
	await cdp.detach();
	return height;
}

/**
 * records the window for a few seconds, moving the pointer across anything named in turn, and saves
 * it as h.264, which every browser plays, muted and the size of the card it plays in
 */
export async function record(
	page: Page,
	id: string,
	{
		scroll,
		top,
		hover,
		travel,
		wander,
		intro,
		length = 8
	}: Exclude<Site['clip'], true | undefined>,
	wide: boolean,
	still: boolean,
	hidden: string
) {
	// the shape of the tile it plays in: 6:5 for the large ones, which are taller than 16:10 to fill
	// the rows beside them, and sharper, and the usual window for the rest
	const size = wide ? { width: 1440, height: 1200 } : VIEWPORT;
	const output = wide ? size : { width: 960, height: 600 };
	await page.setViewportSize(size);

	// headless chrome sends frames a little shorter than the viewport, missing its foot, so the
	// clip would be cut off and stretched to make up for it. the viewport as much taller instead,
	// so the frames are the size of the clip
	const short = size.height - (await frame_height(page));
	if (short > 0 && Number.isFinite(short)) {
		await page.setViewportSize({ width: size.width, height: size.height + short });
	}

	if (scroll) {
		const target = page.locator(scroll).first();
		await target.scrollIntoViewIfNeeded();
		await target.evaluate((node, top) => {
			if (top === undefined) node.scrollIntoView({ block: 'center' });
			else scrollBy({ top: node.getBoundingClientRect().top - top, behavior: 'instant' });
		}, top);
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

	// loaded again while recording, for one that only plays as it loads, from once there is something
	// to show, with what was hidden before hidden again
	let first = 0;
	if (intro) {
		await page.reload({ waitUntil: 'domcontentloaded' });
		await page.addStyleTag({ content: hidden });
		await page.evaluate(hide_popups).catch(() => {});
		first = times.length;
	}

	const targets = [];
	for (const target of hover ? await page.locator(hover).all() : []) {
		if (await target.isVisible()) targets.push(target);
	}

	if (travel) {
		await glide(page, length, travel === true ? undefined : travel, wander);
	} else if (wander) {
		await circle(page, Date.now() + length * 1000);
	} else if (targets.length > 0) {
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

	if (times.length - first < 2) throw new Error('no frames recorded');

	const frame = (i: number) => path.join(frames, `${i}.jpg`);
	const last = times.length - 1;

	// as its screenshot, for a site that differs on every visit, or once it has played for one that
	// plays as it loads
	if (still) {
		for (const other of screenshot_files(id)) fs.rmSync(other, { force: true });
		fs.copyFileSync(frame(intro ? last : first), path.join(SCREENSHOTS, `${id}.jpg`));
	}

	// each frame shown until the next, since the browser only sends one when something changes
	const list = times
		.slice(first)
		.map((time, i) => {
			const until = times[first + i + 1] ?? times[first] + length;
			return `file '${frame(first + i)}'\nduration ${Math.max(until - time, 0.001)}`;
		})
		.join('\n');
	fs.writeFileSync(path.join(frames, 'list.txt'), `${list}\nfile '${frame(last)}'\n`);

	// fades back into the first frame at the end, so it loops without a jump. one that plays as it
	// loads instead starts on its screenshot, how it ends, and fades from it into the start, so it
	// starts as it was on hover and loops without the page it loads from
	const total = Math.max(times[last] - times[first] + 0.001, length);
	const fade = 0.5;
	const fit = `fps=30,scale=${output.width}:${output.height}:flags=lanczos,setsar=1,format=yuv420p,settb=AVTB`;
	const hold = 0.3;

	execFileSync('ffmpeg', [
		...['-y', '-loglevel', 'error'],
		...['-f', 'concat', '-safe', '0', '-i', path.join(frames, 'list.txt')],
		...[
			'-loop',
			'1',
			'-t',
			String(intro ? hold + fade : fade + 0.1),
			'-i',
			frame(intro ? last : first)
		],
		...[
			'-filter_complex',
			intro
				? `[0:v]${fit}[clip];[1:v]${fit}[end];[end][clip]xfade=transition=fade:duration=${fade}:offset=${hold},format=yuv420p`
				: `[0:v]${fit}[clip];[1:v]${fit}[start];[clip][start]xfade=transition=fade:duration=${fade}:offset=${total - fade},format=yuv420p`
		],
		...['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-profile:v', 'high'],
		...['-movflags', '+faststart', path.join(CLIPS, `${id}.mp4`)]
	]);

	fs.rmSync(frames, { recursive: true, force: true });
}

/**
 * moves the pointer round the middle of the window in a slow figure of eight until the given time,
 * for pages that follow the pointer
 */
async function circle(page: Page, end: number) {
	const { width, height } = page.viewportSize() ?? VIEWPORT;
	const start = Date.now();
	while (Date.now() < end) {
		const t = ((Date.now() - start) / 4000) * Math.PI * 2;
		await page.mouse.move(
			width / 2 + Math.sin(t) * width * 0.3,
			height / 2 + Math.sin(t * 2) * height * 0.2
		);
		await page.waitForTimeout(16);
	}
}

/**
 * scrolls a way down the page and back up with the wheel, so that pages which smooth their own
 * scrolling or play things as they scroll do so, holding at the top long enough at both ends that
 * the clip loops from where it started
 */
async function glide(page: Page, length: number, stop?: string, wander = false) {
	// by playwright's selectors, so one can name a section by its text with :has-text()
	const tops = stop
		? await Promise.all(
				(await page.locator(stop).all()).map((element) =>
					element.evaluate((node) => node.getBoundingClientRect().top + scrollY)
				)
			)
		: [];

	const distance = await page.evaluate((tops) => {
		const most = document.documentElement.scrollHeight - innerHeight;

		for (const at of tops) {
			if (at > innerHeight * 0.4) return Math.min(at, most);
		}

		// the top of a section about a screen down, so it stops on a whole one rather than partway
		// through, preferring one that fits in the window and then the nearest to a screen down
		let best = { top: Math.min(innerHeight, most), score: Infinity };
		for (const element of document.querySelectorAll('body *')) {
			const { top, height, width } = element.getBoundingClientRect();
			const at = top + scrollY;
			if (width < innerWidth * 0.8 || height < innerHeight * 0.4) continue;
			if (at < innerHeight * 0.5 || at > innerHeight * 1.6 || at > most) continue;
			if (getComputedStyle(element).position === 'fixed') continue;

			const score = Math.abs(at - innerHeight) + (height > innerHeight * 1.05 ? innerHeight : 0);
			if (score < best.score) best = { top: at, score };
		}

		return best.top;
	}, tops);
	const end = Date.now() + length * 1000;
	const hold = length * 150;
	const move = length * 300;

	const pointing = wander ? circle(page, end) : Promise.resolve();

	// by the clock rather than in steps, since each turn of the wheel takes a while to send
	async function wheel(direction: number) {
		const start = Date.now();
		let done = 0;
		while (done < distance) {
			// eased in and out, so it starts and stops like a hand on the wheel
			const p = Math.min((Date.now() - start) / move, 1);
			const to = distance * (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
			if (to > done) await page.mouse.wheel(0, direction * (to - done));
			done = to;
			await page.waitForTimeout(16);
		}
	}

	await page.waitForTimeout(hold);
	await wheel(1);
	await page.waitForTimeout(hold);
	await wheel(-1);
	// in case the wheel fell short of the top, so the clip ends where it began
	await page.mouse.wheel(0, -distance);

	// and a while at rest there, since pages that smooth their own scrolling lag behind the wheel,
	// so that it has stopped moving before it fades back into the first frame
	await page
		.waitForFunction(
			() =>
				new Promise((resolve) => {
					const from = scrollY;
					setTimeout(() => resolve(scrollY === 0 && from === 0), 300);
				}),
			undefined,
			{ timeout: 5000, polling: 100 }
		)
		.catch(() => {});
	await page.waitForTimeout(Math.max(end - Date.now(), hold));
	await pointing;
}
