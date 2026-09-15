import type { Gist } from '#lib/db/types.d.ts';
import { resolve } from './identity.js';
import * as records from './records.js';

// Server-side, anonymous: public records only. Private apps are read in the browser.

export async function read(repo: string, rkey: string): Promise<Gist | null> {
	const identity = await resolve(repo);
	const client = records.anonymous_client(identity.pds);
	const record = await records.read_public(client, identity.did, rkey);
	if (!record) return null;
	return { ...records.to_gist(identity.did, rkey, record, false), owner_handle: identity.handle };
}

export async function list(repo: string, search: string | null) {
	const identity = await resolve(repo);
	const all = await records.list(records.anonymous_client(identity.pds), identity, false);
	const q = search?.toLowerCase();
	return {
		identity,
		gists: all
			.filter((g) => !q || g.name.toLowerCase().includes(q))
			.map((g) => ({ ...g, id: records.gist_id(identity.handle, records.rkey_of(g.id)) }))
	};
}
