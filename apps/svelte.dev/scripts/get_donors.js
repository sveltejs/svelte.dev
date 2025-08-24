// @ts-check
import 'dotenv/config';
import { Jimp } from 'jimp';
import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const force = process.env.FORCE_UPDATE === 'true';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '../src/routes/_home/Supporters/donors.js');

try {
	if (!force && (await stat(out))) {
		const relative = path.relative(process.cwd(), out);
		console.info(`[update/donors] ${relative} exists. Skipping`);
		process.exit(0);
	}
} catch {
	const MAX = 48;
	const SIZE = 128;

	const res = await fetch('https://opencollective.com/svelte/members/all.json');
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

			included.push({ backer, image });
		} catch (err) {
			console.log(`Skipping ${backer.name}: no image data`);
		}
	}

	const sprite = new Jimp({ width: SIZE * included.length, height: SIZE });
	for (let i = 0; i < included.length; i += 1) {
		sprite.composite(included[i].image, i * SIZE, 0);
	}

	await sprite.write(
		// @ts-expect-error
		fileURLToPath(new URL(`../src/routes/_home/Supporters/donors.jpg`, import.meta.url)),
		{ quality: 80 }
	);

	const str = `[\n\t${included.map((a) => `${JSON.stringify(a.backer.name)}`).join(',\n\t')}\n]`;

	writeFile(out, `export default ${str};`);
}
