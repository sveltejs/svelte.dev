import { redirect } from '@sveltejs/kit';

export const prerender = false;

export function load({ url }) {
	// atproto forbids `localhost` as a loopback origin
	const href = url.href.replace('localhost', '127.0.0.1');

	if (url.searchParams.get('escalate') === '1') {
		redirect(307, new URL(`/auth/atproto/authorize?${url.searchParams}`, href), {
			external: true
		});
	}

	if (url.hostname === 'localhost') {
		redirect(307, url.href.replace('localhost', '127.0.0.1'), {
			external: true
		});
	}
}
