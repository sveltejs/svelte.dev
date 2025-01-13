import * as session from '$lib/db/session';

export const prerender = false;

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: 'nodejs20.x' // see https://github.com/sveltejs/svelte/pull/9136
};

export async function load({ request }) {
	return {
		user: await session.from_cookie(request.headers.get('cookie'))
	};
}
