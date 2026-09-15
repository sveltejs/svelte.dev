import { Client, simpleFetchHandler } from '@atcute/client';
import type { Gist } from '#lib/db/types.d.ts';
import { COLLECTION, space_ref } from './scopes.js';
import * as credential from './space-credential.js';
export { tid as new_rkey } from './tid.js';

export interface PlaygroundRecord {
	$type: typeof COLLECTION;
	name: string;
	files: Array<{ name: string; contents: string }>;
	tailwind?: boolean;
	svelteVersion?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PlaygroundInput {
	name: string;
	tailwind?: boolean;
	svelte_version?: string;
	files: Array<{ name: string; source: string }>;
}

type Failure = { ok: false; status: number; data?: { error?: string; message?: string } };
type Result<T> = { ok: true; data: T } | Failure;

export class PdsError extends Error {
	status: number;
	error?: string;

	constructor(method: string, r: Omit<Failure, 'ok'>) {
		const detail = [r.data?.error, r.data?.message].filter(Boolean).join(': ');
		super(`${method}: PDS answered ${r.status} ${detail}`.trim());
		this.status = r.status;
		this.error = r.data?.error;
	}
}

function fail(method: string, r: Omit<Failure, 'ok'>) {
	return new PdsError(method, r);
}

// atcute's registry doesn't know the space NSIDs; the casts stay here
async function get<T>(client: Client, method: string, params: Record<string, unknown>) {
	return (await client.get(method as never, { params } as never)) as unknown as Result<T>;
}
async function post<T>(client: Client, method: string, input: Record<string, unknown>) {
	return (await client.post(method as never, { input } as never)) as unknown as Result<T>;
}

export function anonymous_client(pds: string) {
	return new Client({ handler: simpleFetchHandler({ service: pds }) });
}

export function gist_id(did: string, rkey: string) {
	return `${did}/${rkey}`;
}

export function to_record(input: PlaygroundInput, created_at?: string): PlaygroundRecord {
	const now = new Date().toISOString();
	const record: PlaygroundRecord = {
		$type: COLLECTION,
		name: input.name,
		files: input.files.map((f) => ({ name: f.name, contents: f.source })),
		createdAt: created_at ?? now,
		updatedAt: now
	};
	if (input.tailwind) record.tailwind = true;
	if (input.svelte_version) record.svelteVersion = input.svelte_version;
	return record;
}

export function to_gist(
	did: string,
	rkey: string,
	record: PlaygroundRecord,
	is_private: boolean
): Gist {
	return {
		id: gist_id(did, rkey),
		name: record.name,
		owner: did,
		tailwind: record.tailwind ?? false,
		private: is_private,
		svelte_version: record.svelteVersion,
		files: record.files.map((f) => ({ name: f.name, type: '', source: f.contents }))
	};
}

export interface Listed {
	id: string;
	name: string;
	private: boolean;
	updated_at: string;
}

export async function read_public(client: Client, did: string, rkey: string) {
	const r = await get<{ value: PlaygroundRecord }>(client, 'com.atproto.repo.getRecord', {
		repo: did,
		collection: COLLECTION,
		rkey
	});
	if (r.ok) return r.data.value;
	if (r.status === 400 || r.status === 404) return null;
	throw fail('getRecord', r);
}

export async function put_public(
	client: Client,
	did: string,
	rkey: string,
	record: PlaygroundRecord
) {
	const r = await post(client, 'com.atproto.repo.putRecord', {
		repo: did,
		collection: COLLECTION,
		rkey,
		record
	});
	if (!r.ok) throw fail('putRecord', r);
}

export async function delete_public(client: Client, did: string, rkey: string) {
	const r = await post(client, 'com.atproto.repo.deleteRecord', {
		repo: did,
		collection: COLLECTION,
		rkey
	});
	if (!r.ok) throw fail('deleteRecord', r);
}

// repo.listRecords returns `uri`, space.listRecords returns `rkey`
type ListedRecord = { uri?: string; rkey?: string; value: PlaygroundRecord };

type Page = { records: ListedRecord[]; cursor?: string };
type Fetch = (params: Record<string, unknown>) => Promise<Result<Page>>;

async function list_all(method: string, fetch: Fetch, base: Record<string, unknown>) {
	const out: Array<{ rkey: string; value: PlaygroundRecord }> = [];
	let cursor: string | undefined;
	do {
		const r = await fetch({ ...base, collection: COLLECTION, limit: 100, cursor });
		if (!r.ok) throw fail(method, r);
		for (const rec of r.data.records) {
			out.push({ rkey: rec.rkey ?? rkey_of(rec.uri!), value: rec.value });
		}
		cursor = r.data.cursor;
	} while (cursor);
	return out;
}

export function list_public(client: Client, did: string) {
	const method = 'com.atproto.repo.listRecords';
	return list_all(method, (params) => get<Page>(client, method, params), { repo: did });
}

/** The space authority is the owner's own PDS. */
export interface Owner {
	did: string;
	pds: string;
}

function space_of({ did, pds }: Owner) {
	return { did, space: space_ref(did), host: pds };
}

export async function read_private(client: Client, owner: Owner, rkey: string) {
	const r = await credential.query<{ value: PlaygroundRecord }>(
		client,
		space_of(owner),
		'com.atproto.space.getRecord',
		{ space: space_ref(owner.did), repo: owner.did, collection: COLLECTION, rkey }
	);
	if (r.ok) return r.data.value;
	if (r.status === 400 || r.status === 404) return null;
	throw fail('space.getRecord', r);
}

export async function put_private(
	client: Client,
	did: string,
	rkey: string,
	record: PlaygroundRecord
) {
	const r = await post(client, 'com.atproto.space.putRecord', {
		space: space_ref(did),
		repo: did,
		collection: COLLECTION,
		rkey,
		record
	});
	if (!r.ok) throw fail('space.putRecord', r);
}

export async function delete_private(client: Client, did: string, rkey: string) {
	const r = await post(client, 'com.atproto.space.deleteRecord', {
		space: space_ref(did),
		repo: did,
		collection: COLLECTION,
		rkey
	});
	if (!r.ok && r.data?.error !== 'SpaceNotFound') throw fail('space.deleteRecord', r);
}

export function list_private(client: Client, owner: Owner) {
	const method = 'com.atproto.space.listRecords';
	return list_all(
		method,
		(params) => credential.query<Page>(client, space_of(owner), method, params as any),
		{ space: space_ref(owner.did), repo: owner.did }
	);
}

export function rkey_of(uri: string) {
	return uri.slice(uri.lastIndexOf('/') + 1);
}

export async function write(
	client: Client,
	did: string,
	rkey: string,
	record: PlaygroundRecord,
	is_private: boolean
) {
	if (is_private) await put_private(client, did, rkey, record);
	else await put_public(client, did, rkey, record);
}

/** Drop the copy living on the other side after a visibility change. */
export async function remove_other(client: Client, did: string, rkey: string, is_private: boolean) {
	if (is_private) await delete_public(client, did, rkey);
	else await delete_private(client, did, rkey);
}

export async function list(
	client: Client,
	owner: Owner,
	include_private: boolean
): Promise<Listed[]> {
	const did = owner.did;
	const [pub, priv] = await Promise.all([
		list_public(client, did),
		include_private ? list_private(client, owner) : Promise.resolve([])
	]);
	const listed = (records: typeof pub, is_private: boolean) =>
		records.map((r) => ({
			id: gist_id(did, r.rkey),
			name: r.value.name,
			private: is_private,
			updated_at: r.value.updatedAt
		}));
	return [...listed(pub, false), ...listed(priv, true)].sort((a, b) =>
		b.updated_at.localeCompare(a.updated_at)
	);
}
