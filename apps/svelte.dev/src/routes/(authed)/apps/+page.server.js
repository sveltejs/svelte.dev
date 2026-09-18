import * as gist from '#lib/db/gist.js';
import * as at from '#lib/atproto/apps.js';
import { SessionError } from '#lib/atproto/client.js';
import { is_destination } from '#lib/destination.js';

/** @typedef {'session' | 'unavailable' | null} ListError */
/** @typedef {{ apps: Array<{ id: string, name: string }>, next: number | null, total?: number, capped?: boolean }} Page */

/**
 * @param {Promise<Page> | null} promise
 * @returns {Promise<{ page: Page | null, error: ListError }>}
 */
async function attempt(promise) {
	if (!promise) return { page: null, error: null };
	try {
		return { page: await promise, error: null };
	} catch (e) {
		if (e instanceof SessionError) return { page: null, error: 'session' };
		console.warn(`apps list: ${/** @type {Error} */ (e).message}`);
		return { page: null, error: 'unavailable' };
	}
}

/** @param {Page | null} page @param {ListError} error */
function count(page, error) {
	if (error) return '?';
	if (!page) return '0';
	return `${page.total ?? page.apps.length}${page.capped || page.next !== null ? '+' : ''}`;
}

export async function load({ url, parent }) {
	const search = url.searchParams.get('search');
	const offset_param = url.searchParams.get('offset');
	const offset = offset_param ? parseInt(offset_param) : 0;

	const { accounts, destination } = await parent();

	const tab_param = url.searchParams.get('tab');
	// an unavailable tab still opens: it explains how to enable it
	const tab = is_destination(tab_param) ? tab_param : (destination ?? 'atproto-public');

	// atproto lists are fetched whole anyway (see atproto/apps.ts `walk`), so they double as counts
	const [github, atproto_public, atproto_private] = await Promise.all([
		accounts.github
			? gist
					.list(accounts.github, { offset, search })
					.then(({ gists, next }) => ({ apps: gists, next }))
			: null,
		attempt(
			accounts.atproto
				? at.list_public(accounts.atproto.did, search, tab === 'atproto-public' ? offset : 0)
				: null
		),
		attempt(
			accounts.atproto
				? at.list_private(
						url.origin,
						accounts.atproto,
						search,
						tab === 'atproto-private' ? offset : 0
					)
				: null
		)
	]);

	const empty = { apps: [], next: null };
	const pages = {
		github: github ?? empty,
		'atproto-public': atproto_public.page ?? empty,
		'atproto-private': atproto_private.page ?? empty
	};

	/** @type {Record<string, string>} */
	const counts = {
		github: count(github, null),
		'atproto-public': count(atproto_public.page, atproto_public.error),
		'atproto-private': count(atproto_private.page, atproto_private.error)
	};

	/** @type {Record<string, ListError>} */
	const errors = {
		github: null,
		'atproto-public': atproto_public.error,
		'atproto-private': atproto_private.error
	};

	return {
		apps: pages[tab].apps,
		next: pages[tab].next,
		error: errors[tab],
		search,
		tab,
		counts
	};
}
