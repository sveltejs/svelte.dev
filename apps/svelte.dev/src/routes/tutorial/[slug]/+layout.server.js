import { get_index } from '$lib/server/tutorial/content.js';

export async function load() {
	return {
		index: await get_index()
	};
}
