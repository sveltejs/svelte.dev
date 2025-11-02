import { query } from '$app/server';
import * as gist from '$lib/db/gist';
import { get_user } from '$lib/remote/auth.remote';
import * as v from 'valibot';

export const get_gists = query(
	v.object({
		search: v.string(),
		offset: v.optional(v.number())
	}),
	async ({ search, offset = 0 }) => {
		const user = await get_user();

		if (!user) {
			return { gists: [], next: null };
		}

		return gist.list(user, { offset, search });
	}
);
