// @ts-check

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
