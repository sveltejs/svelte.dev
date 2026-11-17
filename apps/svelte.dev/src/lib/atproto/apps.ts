import { error } from '@sveltejs/kit';
import {
	ValidationError,
	type DidString,
	type Identity,
	type PageQuery,
	type RecordInput
} from 'airspace';
import type { AtprotoSessionUser, Gist } from '#lib/db/types.d.ts';
import { anonymous, invalidate_public, own } from './client.js';
import { resolve, type Resolved } from './identity.js';
import type { playground } from './lexicons.js';

// Server-side.

type Value = RecordInput<typeof playground>;

export interface Input {
	name: string;
	tailwind?: boolean;
	svelte_version?: string;
	async?: boolean;
	forked_from?: string;
	files: Array<{ name: string; source: string }>;
}

export interface AppSummary {
	id: string;
	name: string;
	updated_at: string;
}

export interface Page {
	apps: AppSummary[];
	next: number | null;
	total: number;
	/** `total` stopped at MAX_RECORDS */
	capped: boolean;
}

const PAGE_SIZE = 90;
const RECORDS_PER_REQUEST = 100;
// a PDS pages by cursor and filters nothing, so a listing walks the repo up to here
const MAX_RECORDS = 500;

type Stored = { rkey: string; value: Value };
type Reader<T extends Stored> = {
	page: (query?: PageQuery) => Promise<{ records: T[]; cursor?: string }>;
};

/** The MAX_RECORDS newest by key, sorted by last update. */
async function walk<T extends Stored>(reader: Reader<T>) {
	const records: T[] = [];
	let cursor: string | undefined;

	do {
		const page = await reader.page({
			limit: Math.min(RECORDS_PER_REQUEST, MAX_RECORDS - records.length),
			cursor
		});
		records.push(...page.records);
		cursor = page.cursor;
	} while (cursor && records.length < MAX_RECORDS);

	return {
		records: records.sort((a, b) => b.value.updatedAt.localeCompare(a.value.updatedAt)),
		capped: !!cursor
	};
}

function paginate(all: AppSummary[], offset: number, capped: boolean): Page {
	return {
		apps: all.slice(offset, offset + PAGE_SIZE),
		next: all.length > offset + PAGE_SIZE ? offset + PAGE_SIZE : null,
		total: all.length,
		capped
	};
}

export function split(id: string) {
	const slash = id.indexOf('/');
	if (slash === -1) error(400, 'invalid id');
	return { repo: id.slice(0, slash), rkey: id.slice(slash + 1) };
}

function to_value(input: Input, created_at?: string): Value {
	const now = new Date().toISOString() as Value['createdAt'];
	return {
		name: input.name,
		files: input.files.map((f) => ({ name: f.name, contents: f.source })),
		...(input.tailwind ? { tailwind: true } : {}),
		...(input.svelte_version ? { svelteVersion: input.svelte_version } : {}),
		...(input.async !== undefined ? { async: input.async } : {}),
		...(input.forked_from ? { forkedFrom: input.forked_from } : {}),
		createdAt: (created_at as Value['createdAt']) ?? now,
		updatedAt: now
	};
}

function to_gist(owner: { did: string; handle: string }, rkey: string, value: Value): Gist {
	return {
		id: `${owner.handle}/${rkey}`,
		name: value.name,
		owner: owner.did,
		owner_handle: owner.handle,
		tailwind: value.tailwind ?? false,
		svelte_version: value.svelteVersion,
		async: value.async,
		forked_from: value.forkedFrom,
		files: value.files.map((f) => ({ name: f.name, type: '', source: f.contents }))
	};
}

function to_summary(owner: { handle: string }) {
	return (r: Stored): AppSummary => ({
		id: `${owner.handle}/${r.rkey}`,
		name: r.value.name,
		updated_at: r.value.updatedAt
	});
}

function matches(search: string | null) {
	const q = search?.toLowerCase();
	return (g: { name: string }) => !q || g.name.toLowerCase().includes(q);
}

function identity_of({ did, pds }: Resolved): Identity {
	return { did: did as DidString, service: pds };
}

/** A handle that does not resolve owns nothing. */
async function resolve_or_null(repo: string) {
	return resolve(repo).catch(() => null);
}

/** The user's current handle: the one in the login row is as old as the login. */
function owner(user: AtprotoSessionUser) {
	return resolve(user.did);
}

async function owner_of(user: AtprotoSessionUser, repo: string) {
	const did = repo.startsWith('did:') ? repo : (await resolve_or_null(repo))?.did;
	return did === user.did;
}

/** A record another client wrote outside the lexicon reads like a missing one. */
async function valid<T>(get: Promise<T | null>) {
	try {
		return await get;
	} catch (e) {
		if (e instanceof ValidationError) return null;
		throw e;
	}
}

export async function read(repo: string, rkey: string): Promise<Gist | null> {
	const identity = await resolve_or_null(repo);
	if (!identity) return null;

	const app = await valid(anonymous(identity_of(identity)).playgrounds.get(rkey));
	return app ? to_gist(identity, rkey, app.value) : null;
}

export async function list_public(repo: string, search: string | null, offset = 0) {
	const identity = await resolve(repo);
	const { records, capped } = await walk(anonymous(identity_of(identity)).playgrounds);
	const all = records.map(to_summary(identity)).filter(matches(search));
	return { identity, ...paginate(all, offset, capped) };
}

export async function create(origin: string, user: AtprotoSessionUser, input: Input) {
	const [me, airspace] = await Promise.all([owner(user), own(origin, user)]);
	const value = to_value(input);
	const { rkey } = await airspace.playgrounds.create(value);
	invalidate_public(user.did);
	return to_gist(me, rkey, value);
}

export async function update(origin: string, user: AtprotoSessionUser, id: string, input: Input) {
	const { repo, rkey } = split(id);
	if (!(await owner_of(user, repo))) error(403, 'not your app');
	const airspace = await own(origin, user);

	const existing = await airspace.playgrounds.get(rkey);
	if (!existing) error(404, 'not found');

	// the origin of an app is set once, when it is forked
	const kept = { ...input, forked_from: existing.value.forkedFrom };
	await airspace.playgrounds.put(rkey, to_value(kept, existing.value.createdAt));
	invalidate_public(user.did);
}

export async function destroy(origin: string, user: AtprotoSessionUser, ids: string[]) {
	const rkeys = await Promise.all(
		ids.map(async (id) => {
			const { repo, rkey } = split(id);
			if (!(await owner_of(user, repo))) error(403, 'not your app');
			return rkey;
		})
	);

	const airspace = await own(origin, user);
	// one commit, over the keys that are actually there; a walk would stop at MAX_RECORDS
	const found = await Promise.all(rkeys.map((rkey) => valid(airspace.playgrounds.get(rkey))));
	const present = rkeys.filter((_, i) => found[i]);
	if (present.length === 0) return;

	await airspace.batch((b) => {
		for (const rkey of present) b.playgrounds.delete(rkey);
	});
	invalidate_public(user.did);
}
