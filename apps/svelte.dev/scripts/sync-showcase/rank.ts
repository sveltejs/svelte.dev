import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { categories, members } from '../../src/routes/showcase/sites.ts';

/** the million best known domains, from most to least, as rank,domain on each line in a zip */
const LIST = 'https://tranco-list.eu/top-1m.csv.zip';

/**
 * prints how well known each site of the categories is by its rank on tranco, and says where one
 * is ahead of a better known one. the first in each category is chosen by hand, so only the rest
 * are held to it. needs unzip
 */
export async function rank() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-rank-'));
	const file = path.join(directory, 'list.zip');

	const response = await fetch(LIST);
	if (!response.ok) throw new Error(`could not fetch ${LIST} (HTTP ${response.status})`);
	fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));

	const ranks = new Map<string, number>();
	const list = execFileSync('unzip', ['-p', file], { encoding: 'utf8', maxBuffer: 2 ** 28 });
	for (const line of list.split('\n')) {
		const [place, domain] = line.trim().split(',');
		if (domain) ranks.set(domain, Number(place));
	}

	fs.rmSync(directory, { recursive: true, force: true });

	/** by its own domain, or the nearest one above it that is ranked */
	function rank_of(url: string) {
		const labels = new URL(url).hostname.replace(/^www\./, '').split('.');

		for (let i = 0; i < labels.length - 1; i += 1) {
			const found = ranks.get(labels.slice(i).join('.'));
			if (found) return found;
		}

		return Infinity;
	}

	let misplaced = 0;

	for (const category of categories) {
		console.log(`\n${category.title}`);

		let before = 0;
		members(category.id).forEach((site, i) => {
			const place = rank_of(site.url);
			const late = i > 1 && place < before;
			if (late) misplaced += 1;
			if (i > 0) before = place;

			console.log(
				`  ${place === Infinity ? 'unranked' : String(place).padStart(8)}  ${site.id}${
					i === 0
						? '  (first, chosen by hand)'
						: late
							? '  ← better known than the one before it'
							: ''
				}`
			);
		});
	}

	if (misplaced > 0) console.log(`\n${misplaced} out of order`);
}
