import type { File } from './types';

export const clamp = (min: number, max: number, value: number) =>
	Math.max(min, Math.min(max, value));

export const sleep = (ms: number) => new Promise((f) => setTimeout(f, ms));

export function get_full_filename(file: File) {
	return `${file.name}.${file.type}`;
}
