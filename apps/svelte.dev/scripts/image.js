// @ts-check

/** @param {{ bitmap: { data: Buffer } }} image */
export function has_low_color_variance(image) {
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
