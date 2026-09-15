import { browser } from '$app/env';
import { error } from '@sveltejs/kit';
import * as at_gist from '#lib/atproto/gist.js';

// SSR can't read a private atproto app (tokens are in the browser): it renders an empty
// shell and this load re-runs on hydration with the owner's client
const PLACEHOLDER = { id: '', name: 'Loading…', owner: null, tailwind: false, components: [] };

export async function load({ data, url, params, parent }) {
	let gist = data.gist;
	if (!gist) {
		if (!browser) {
			gist = PLACEHOLDER;
		} else {
			const { accounts } = await parent();
			const app = accounts.atproto
				? await at_gist.read_private(accounts.atproto, params.id).catch(() => null)
				: null;
			if (!app) error(404, 'not found');
			gist = {
				...app,
				relaxed: false,
				components: app.files.map((file) => {
					const dot = file.name.lastIndexOf('.');
					return {
						name: file.name.slice(0, dot),
						type: file.name.slice(dot + 1),
						source: file.source
					};
				})
			};
		}
	}

	// initialize vim with the search param
	const vim_search_params = url.searchParams.get('vim');
	let vim = vim_search_params !== null && vim_search_params !== 'false';
	// when in the browser check if there's a local storage entry and eventually override
	// vim if there's not a search params otherwise update the local storage
	if (browser) {
		try {
			const vim_local_storage = window.localStorage.getItem('svelte:vim-enabled');
			if (vim_search_params !== null) {
				window.localStorage.setItem('svelte:vim-enabled', vim.toString());
			} else if (vim_local_storage) {
				vim = vim_local_storage !== 'false';
			}
		} catch {
			// localStorage access disabled
		}
	}
	return { ...data, gist, vim };
}
