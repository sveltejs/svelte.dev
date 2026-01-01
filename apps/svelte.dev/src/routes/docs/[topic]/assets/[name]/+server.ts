import { read } from '$app/server';
import { docs } from '$lib/server/content';
import { error } from '@sveltejs/kit';

export async function GET({ params: { name, topic } }) {
	const assets = docs.topics[`docs/${topic}`].assets;
	if (!assets) {
		error(404, 'No assets found for this topic');
	}

	return read(assets[name]);
}
