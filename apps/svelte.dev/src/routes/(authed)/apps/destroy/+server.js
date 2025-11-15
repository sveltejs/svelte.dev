import * as gist from '$lib/db/gist';
import { get_user } from '$lib/remote/auth.remote.js';

// TODO this should be a `form` or `command`
export async function POST({ request }) {
	const user = await get_user();
	if (!user) return new Response(undefined, { status: 401 });

	const body = await request.json();
	await gist.destroy(user.id, body.ids);

	return new Response(undefined, { status: 204 });
}
