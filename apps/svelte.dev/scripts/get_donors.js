// @ts-check
import { Jimp } from 'jimp';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { has_supporters, is_blank, write_fallback } from './utils.js';

const force = process.env.FORCE_UPDATE === 'true';
const fallback = process.env.ALLOW_FALLBACK === 'true';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '../src/routes/_home/Supporters/donors.js');
const sprite_out = path.resolve(__dirname, '../src/routes/_home/Supporters/donors.jpg');

// builds regenerate a fallback list, so they never ship without supporters
if (!force && (fallback ? existsSync(out) : has_supporters(out))) {
	const relative = path.relative(process.cwd(), out);
	console.info(`[update/donors] ${relative} exists. Skipping`);
	process.exit(0);
}

try {
	const MAX = 48;
	const SIZE = 128;

	const res = await fetch('https://opencollective.com/svelte/members/all.json');
	if (!res.ok) throw new Error(`Could not load donors: ${res.status}`);

	const donors = await res.json();

	if (!Array.isArray(donors)) throw new Error('Expected an array');

	const unique = new Map();
	donors.forEach((d) => unique.set(d.profile, d));

	let backers = [...unique.values()]
		.filter(({ role }) => role === 'BACKER')
		.sort((a, b) => b.totalAmountDonated - a.totalAmountDonated)
		.slice(0, 3 * MAX);

	const included = [];
	for (let i = 0; included.length < MAX; i += 1) {
		const backer = backers[i];
		console.log(`${included.length + 1} / ${MAX}: ${backer.name}`);

		try {
			const image_data = await fetch(backer.image);
			const buffer = await image_data.arrayBuffer();
			const image = await Jimp.fromBuffer(buffer);

			image.resize({ w: SIZE, h: SIZE });

			if (is_blank(image)) {
				console.log(`Skipping ${backer.name}: low-variance image`);
				continue;
			}

			included.push({ backer, image });
		} catch (err) {
			console.log(`Skipping ${backer.name}: no image data`);
		}
	}

	const sprite = new Jimp({ width: SIZE * included.length, height: SIZE });
	for (let i = 0; i < included.length; i += 1) {
		sprite.composite(included[i].image, i * SIZE, 0);
	}

	// @ts-expect-error
	await sprite.write(sprite_out, { quality: 80 });

	const str = `[\n\t${included.map((a) => `${JSON.stringify(a.backer.name)}`).join(',\n\t')}\n]`;

	await writeFile(out, `export default ${str};`);
} catch (err) {
	if (has_supporters(out)) {
		// keep the existing files when a forced update fails
		console.warn(`[update/donors] Could not load donors, keeping existing list: ${err}`);
	} else if (fallback) {
		// type checking and local dev don't need the real list, so don't let
		// rate limiting or network failures break them
		console.warn(`[update/donors] Could not load donors, writing an empty list: ${err}`);
		await write_fallback(out, sprite_out);
	} else {
		throw err;
	}
}
