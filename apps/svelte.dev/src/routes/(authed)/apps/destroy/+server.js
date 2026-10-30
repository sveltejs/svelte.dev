import * as session from '#lib/db/session.js';
import * as gist from '#lib/db/gist.js';

export async function POST({ request }) {
	const user = await session.from_cookie(request.headers.get('cookie'));
	if (!user) return new Response(undefined, { status: 401 });

	const body = await request.json();
	await gist.destroy(user.id, body.ids);

	return new Response(undefined, { status: 204 });
}
