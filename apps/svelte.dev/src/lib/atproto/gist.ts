import type { AtprotoSessionUser, Gist } from '#lib/db/types.d.ts';
import { identity, own_client } from './auth.js';
import * as records from './records.js';

// Browser-side: everything that needs the user's own tokens. ids are `<handle-or-did>/<rkey>`

export interface Input extends records.PlaygroundInput {
	private?: boolean;
}

const DID_REGEX = /^did:/;

export function split(id: string) {
	const slash = id.indexOf('/');
	if (slash === -1) throw new Error('invalid id');
	return { repo: id.slice(0, slash), rkey: id.slice(slash + 1) };
}

async function own(user: AtprotoSessionUser, repo: string) {
	const did = DID_REGEX.test(repo) ? repo : (await identity(repo)).did;
	if (did !== user.did) throw new Error('not your app');
	return own_client(user.did);
}

function id_for(user: AtprotoSessionUser, rkey: string) {
	return records.gist_id(user.handle || user.did, rkey);
}

/** Private apps are only readable by their owner. */
export async function read_private(user: AtprotoSessionUser, id: string): Promise<Gist | null> {
	if (!user.private_apps) return null;
	const { repo, rkey } = split(id);
	const did = DID_REGEX.test(repo) ? repo : (await identity(repo)).did;
	if (did !== user.did) return null;
	const record = await records.read_private(await own_client(user.did), user, rkey);
	if (!record) return null;
	return { ...records.to_gist(user.did, rkey, record, true), owner_handle: user.handle };
}

export async function create(user: AtprotoSessionUser, input: Input): Promise<Gist> {
	const is_private = !!input.private && user.private_apps;
	const client = await own_client(user.did);
	const rkey = records.new_rkey();
	const record = records.to_record(input);
	await records.write(client, user.did, rkey, record, is_private);
	return { ...records.to_gist(user.did, rkey, record, is_private), id: id_for(user, rkey) };
}

export async function update(user: AtprotoSessionUser, id: string, input: Input) {
	const { repo, rkey } = split(id);
	const client = await own(user, repo);

	const [pub, priv] = await Promise.all([
		records.read_public(client, user.did, rkey),
		user.private_apps ? records.read_private(client, user, rkey) : null
	]);
	const existing = pub ?? priv;
	if (!existing) throw new Error('not found');

	const was_private = !pub;
	const is_private =
		input.private === undefined ? was_private : !!input.private && user.private_apps;

	const record = records.to_record(input, existing.createdAt);
	await records.write(client, user.did, rkey, record, is_private);
	if (is_private !== was_private) {
		await records.remove_other(client, user.did, rkey, is_private);
	}
}

export async function destroy(user: AtprotoSessionUser, ids: string[]) {
	const client = await own_client(user.did);
	for (const id of ids) {
		const { repo, rkey } = split(id);
		await own(user, repo);
		await records.delete_public(client, user.did, rkey);
		if (user.private_apps) await records.delete_private(client, user.did, rkey);
	}
}

/** Public apps are listed server-side; only the private ones need the token. */
export async function list_private(user: AtprotoSessionUser, search: string | null) {
	if (!user.private_apps) return [];
	const client = await own_client(user.did);
	const all = await records.list_private(client, user);
	const q = search?.toLowerCase();
	return all
		.filter((r) => !q || r.value.name.toLowerCase().includes(q))
		.map((r) => ({
			id: id_for(user, r.rkey),
			name: r.value.name,
			private: true,
			updated_at: r.value.updatedAt
		}))
		.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}
