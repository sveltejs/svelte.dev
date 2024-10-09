import { parts } from './content.server';

export async function load() {
	return {
		index: parts
	};
}
