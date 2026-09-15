import { browser } from '$app/env';
import * as at_gist from '#lib/atproto/gist.js';
import { is_destination } from '#lib/destination.js';

export async function load({ url, data, parent }) {
	const { accounts, destination } = await parent();

	const tab_param = url.searchParams.get('tab');
	// an unavailable tab still opens: it explains how to enable it
	const tab = is_destination(tab_param) ? tab_param : (destination ?? 'atproto-public');

	// private apps need the user's tokens, which only exist in the browser
	const atproto_private =
		browser && accounts.atproto && tab === 'atproto-private'
			? await at_gist.list_private(accounts.atproto, data.search).catch(() => [])
			: [];

	const lists = {
		github: data.github.gists,
		'atproto-public': data.atproto_public,
		'atproto-private': atproto_private
	};

	// the private count is only known once its tab was opened; show 0 rather than nothing
	const counts: Record<string, string> = {
		github: data.github.next !== null ? `${data.github.gists.length}+` : `${lists.github.length}`,
		'atproto-public': `${lists['atproto-public'].length}`,
		'atproto-private': `${atproto_private.length}`
	};

	return {
		gists: lists[tab],
		next: tab === 'github' ? data.github.next : null,
		search: data.search,
		tab,
		counts
	};
}
