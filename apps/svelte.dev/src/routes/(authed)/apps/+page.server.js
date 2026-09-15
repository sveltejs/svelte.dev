import * as gist from '#lib/db/gist.js';
import * as at from '#lib/atproto/public.js';

export async function load({ url, parent }) {
	const search = url.searchParams.get('search');
	const offset_param = url.searchParams.get('offset');
	const offset = offset_param ? parseInt(offset_param) : 0;

	const { accounts } = await parent();

	const [github, atproto] = await Promise.all([
		accounts.github ? gist.list(accounts.github, { offset, search }) : null,
		accounts.atproto ? at.list(accounts.atproto.handle, search).catch(() => null) : null
	]);

	return {
		search,
		github: github ?? { gists: [], next: null },
		atproto_public: atproto?.gists ?? []
	};
}
