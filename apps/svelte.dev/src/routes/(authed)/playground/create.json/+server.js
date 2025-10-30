import * as gist from '$lib/db/gist';
import { get_user } from '$lib/remote/auth.remote.js';
import { error, json } from '@sveltejs/kit';

export async function POST({ request }) {
	const user = await get_user();
	if (!user) error(401);

	const body = await request.json();
	const result = await gist.create(user, body);

	// normalize id
	result.id = result.id.replace(/-/g, '');

	return json(result, {
		status: 201
	});
}
