// @ts-check
import { Jimp } from 'jimp';
import { stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { is_blank, write_fallback } from './utils.js';

const force = process.env.FORCE_UPDATE === 'true';
const repositories = ['svelte', 'kit', 'cli', 'vite-plugin-svelte', 'language-tools', 'ai-tools'];
const automated_accounts = new Set(['copilot', 'claude']);

/**
 * @typedef {{ login: string; avatar_url: string; contributions: number }} Contributor
 */

/**
 * @param {Contributor[][]} contributor_lists
 * @param {number} max
 */
function select_contributors(contributor_lists, max) {
	const lists = contributor_lists.map((contributors) =>
		contributors.filter(
			({ login }) => !login.includes('[bot]') && !automated_accounts.has(login.toLowerCase())
		)
	);
	const indices = lists.map(() => 0);
	const selected = [];
	const selected_logins = new Set();

	while (selected.length < max) {
		let advanced = false;

		for (let i = 0; i < lists.length && selected.length < max; i += 1) {
			while (indices[i] < lists[i].length) {
				const contributor = lists[i][indices[i]++];
				advanced = true;

				if (selected_logins.has(contributor.login)) continue;

				selected.push(contributor);
				selected_logins.add(contributor.login);
				break;
			}
		}

		if (!advanced) break;
	}

	return selected;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '../src/routes/_home/Supporters/contributors.js');
const sprite_out = path.resolve(__dirname, '../src/routes/_home/Supporters/contributors.jpg');

try {
	if (!force && (await stat(out))) {
		const relative = path.relative(process.cwd(), out);
		console.info(`[update/contributors] ${relative} exists. Skipping`);
		process.exit(0);
	}
} catch {
	try {
		const MAX = 48;
		const SIZE = 128;

		/** @type {Record<string, string>} */
		const headers = {};
		if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

		const contributor_lists = await Promise.all(
			repositories.map(async (repository) => {
				const contributors = [];
				let page = 1;

				while (true) {
					const params = new URLSearchParams({ per_page: '100', page: String(page++) });

					const url = `https://api.github.com/repos/sveltejs/${repository}/contributors?${params}`;
					const res = await fetch(url, { headers });
					if (!res.ok)
						throw new Error(`Could not load contributors for ${repository}: ${res.status}`);

					const list = await res.json();
					if (!Array.isArray(list)) throw new Error(`Expected an array for ${repository}`);
					if (list.length === 0) break;

					contributors.push(...list);
				}

				return contributors;
			})
		);

		const candidates = select_contributors(contributor_lists, Infinity);
		const authors = [];
		const images = [];

		for (const author of candidates) {
			console.log(`${authors.length + 1} / ${MAX}: ${author.login}`);

			const image_data = await fetch(author.avatar_url);
			const buffer = await image_data.arrayBuffer();
			const image = await Jimp.fromBuffer(buffer);

			image.resize({ w: SIZE, h: SIZE });

			if (is_blank(image)) {
				console.log(`Skipping ${author.login}: low-variance avatar`);
				continue;
			}

			authors.push(author);
			images.push(image);
			if (authors.length === MAX) break;
		}

		const sprite = new Jimp({ width: SIZE * authors.length, height: SIZE });
		for (let i = 0; i < images.length; i += 1) {
			sprite.composite(images[i], i * SIZE, 0);
		}

		// @ts-expect-error
		await sprite.write(sprite_out, { quality: 80 });

		const str = `[\n\t${authors.map((a) => `'${a.login}'`).join(',\n\t')}\n]`;

		await writeFile(out, `export default ${str};`);
	} catch (err) {
		// rate limiting or network failures shouldn't break the build
		console.warn(`[update/contributors] Could not load contributors: ${err}`);
		await write_fallback(out, sprite_out);
	}
}
