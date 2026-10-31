// @ts-check
import { Jimp } from 'jimp';
import { writeFile } from 'node:fs/promises';

/**
 * GitHub and OSC profile pictures are a single plain colour (usually black)
 * for disabled accounts. There's no point to show these profile pictures if
 * they're from OSC because all OSC contributors link to the same Svelte OSC
 * page anyway (GitHub ones link to their user profile).
 * @param {{ bitmap: { data: Buffer } }} image
 * @returns {boolean}
 */
export function is_blank(image) {
	const { data } = image.bitmap;
	const min = [255, 255, 255];
	const max = [0, 0, 0];

	for (let i = 0; i < data.length; i += 4) {
		for (let channel = 0; channel < 3; channel += 1) {
			min[channel] = Math.min(min[channel], data[i + channel]);
			max[channel] = Math.max(max[channel], data[i + channel]);
		}
	}

	return max.every((value, channel) => value - min[channel] <= 32);
}

/**
 * Writes an empty supporters list and a placeholder sprite, so that type
 * checking and builds still work when the supporters can't be fetched
 * (e.g. because the GitHub API is rate limiting us)
 * @param {string} out
 * @param {string} sprite_out
 */
export async function write_fallback(out, sprite_out) {
	const sprite = new Jimp({ width: 1, height: 1 });
	// @ts-expect-error
	await sprite.write(sprite_out, { quality: 80 });
	await writeFile(out, 'export default [];');
}
