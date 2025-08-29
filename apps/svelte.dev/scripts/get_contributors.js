// @ts-check
import 'dotenv/config';
import { Jimp } from 'jimp';
import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const force = process.env.FORCE_UPDATE === 'true';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '../src/routes/_home/Supporters/contributors.js');

try {
	if (!force && (await stat(out))) {
		const relative = path.relative(process.cwd(), out);
		console.info(`[update/contributors] ${relative} exists. Skipping`);
		process.exit(0);
	}
} catch {
	const base = `https://api.github.com/repos/sveltejs/svelte/contributors`;
	const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

	const MAX = 48;
	const SIZE = 128;

	const contributors = [];
	let page = 1;

	while (true) {
		const res = await fetch(
			`${base}?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&per_page=100&page=${page++}`
		);
		const list = await res.json();

		if (!Array.isArray(list)) throw new Error('Expected an array');

		if (list.length === 0) break;

		contributors.push(...list);
	}

	const authors = contributors
		.filter(({ login }) => !login.includes('[bot]'))
		.sort((a, b) => b.contributions - a.contributions)
		.slice(0, MAX);

	const sprite = new Jimp({ width: SIZE * authors.length, height: SIZE });

	for (let i = 0; i < authors.length; i += 1) {
		const author = authors[i];
		console.log(`${i + 1} / ${authors.length}: ${author.login}`);

		const image_data = await fetch(author.avatar_url);
		const buffer = await image_data.arrayBuffer();
		const image = await Jimp.fromBuffer(buffer);

		image.resize({ w: SIZE, h: SIZE });

		sprite.composite(image, i * SIZE, 0);
	}

	await sprite.write(
		// @ts-expect-error
		fileURLToPath(new URL(`../src/routes/_home/Supporters/contributors.jpg`, import.meta.url)),
		{ quality: 80 }
	);

	const str = `[\n\t${authors.map((a) => `'${a.login}'`).join(',\n\t')}\n]`;

	writeFile(out, `export default ${str};`);
}
