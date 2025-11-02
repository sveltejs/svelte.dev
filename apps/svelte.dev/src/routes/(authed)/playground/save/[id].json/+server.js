import * as gist from '$lib/db/gist';
import { get_user } from '$lib/remote/auth.remote.js';
import { error } from '@sveltejs/kit';

// TODO reimplement as an action
export async function PUT({ params, request }) {
	const user = await get_user();
	if (!user) error(401, 'Unauthorized');

	const body = await request.json();
	await gist.update(user, params.id, body);

	return new Response(undefined, { status: 204 });
}
