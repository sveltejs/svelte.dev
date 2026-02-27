import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	const query = url.searchParams;
	const gist = query.get('gist');
	const example = query.get('example');
	const version = query.get('version');
	const vim = query.get('vim');
	const id = gist || example || 'hello-world';
	// we need to filter out null values
	const q = new URLSearchParams();
	if (version) q.set('version', version);
	if (vim) q.set('vim', vim);
	redirect(301, `/playground/${id}?${q}`);
}
