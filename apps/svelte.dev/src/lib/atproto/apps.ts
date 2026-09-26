import { error } from '@sveltejs/kit';
import type { DidString, Identity, PageQuery, RecordInput } from 'airspace';
import type { AtprotoSessionUser, Gist } from '#lib/db/types.d.ts';
import { anonymous, invalidate_public, own, SessionError, type Airspace } from './client.js';
import { resolve, type Resolved } from './identity.js';
import type { playground } from './lexicons.js';

// Server-side. App ids are `<handle-or-did>/<rkey>`; public apps are readable by anyone,
// private ones only by their owner through their own session.

type Value = RecordInput<typeof playground>;

export interface Input {
	name: string;
	tailwind?: boolean;
	svelte_version?: string;
	files: Array<{ name: string; source: string }>;
}

export interface AppSummary {
	id: string;
	name: string;
	private: boolean;
	updated_at: string;
}

export interface Page {
	apps: AppSummary[];
	next: number | null;
	total: number;
	/** `total` stopped at MAX_RECORDS; there are older apps we did not fetch. */
	capped: boolean;
}

const PAGE_SIZE = 90;
const RECORDS_PER_REQUEST = 100;
/**
 * A PDS pages by cursor and filters nothing, so a listing walks the repo and stops here.
 * Supabase does the paging and the search itself, which is why the GitHub list has no cap.
 */
const MAX_RECORDS = 500;

type Stored = { rkey: string; value: Value };
type Reader<T extends Stored> = {
	page: (query?: PageQuery) => Promise<{ records: T[]; cursor?: string }>;
};

/** The MAX_RECORDS newest records by key, handed back most recently updated first. */
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
		createdAt: (created_at as Value['createdAt']) ?? now,
		updatedAt: now
	};
}

function to_gist(
	owner: { did: string; handle: string },
	rkey: string,
	value: Value,
	is_private: boolean
): Gist {
	return {
		id: `${owner.handle}/${rkey}`,
		name: value.name,
		owner: owner.did,
		owner_handle: owner.handle,
		tailwind: value.tailwind ?? false,
		private: is_private,
		svelte_version: value.svelteVersion,
		files: value.files.map((f) => ({ name: f.name, type: '', source: f.contents }))
	};
}

function to_summary(owner: { handle: string }, is_private: boolean) {
	return (r: Stored): AppSummary => ({
		id: `${owner.handle}/${r.rkey}`,
		name: r.value.name,
		private: is_private,
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

async function owner_of(user: AtprotoSessionUser, repo: string) {
	const did = repo.startsWith('did:') ? repo : (await resolve(repo)).did;
	return did === user.did;
}

/** Public first; the owner also sees their private copy. */
export async function read(
	origin: string,
	repo: string,
	rkey: string,
	viewer: AtprotoSessionUser | null
): Promise<Gist | null> {
	const identity = await resolve(repo);
	const pub = await anonymous(identity_of(identity)).playgrounds.get(rkey);
	if (pub) return to_gist(identity, rkey, pub.value, false);

	if (!viewer?.private_apps || viewer.did !== identity.did) return null;
	try {
		const priv = await (await own(origin, viewer)).private_apps.playgrounds.get(rkey);
		return priv ? to_gist(identity, rkey, priv.value, true) : null;
	} catch (e) {
		// a dead session reads like a stranger: not found rather than 500
		if (e instanceof SessionError) return null;
		throw e;
	}
}

export async function list_public(repo: string, search: string | null, offset = 0) {
	const identity = await resolve(repo);
	const { records, capped } = await walk(anonymous(identity_of(identity)).playgrounds);
	const all = records.map(to_summary(identity, false)).filter(matches(search));
	return { identity, ...paginate(all, offset, capped) };
}

export async function list_private(
	origin: string,
	user: AtprotoSessionUser,
	search: string | null,
	offset = 0
): Promise<Page> {
	if (!user.private_apps) return paginate([], 0, false);
	const { records, capped } = await walk((await own(origin, user)).private_apps.playgrounds);
	return paginate(records.map(to_summary(user, true)).filter(matches(search)), offset, capped);
}

function home(airspace: Airspace, is_private: boolean) {
	return is_private ? airspace.private_apps.playgrounds : airspace.playgrounds;
}

/** One commit, over the keys that are actually there. */
async function remove_all(airspace: Airspace, is_private: boolean, rkeys: string[]) {
	const { records } = await walk(home(airspace, is_private));
	const present = records.filter((r) => rkeys.includes(r.rkey));
	if (present.length === 0) return;

	const target = is_private ? airspace.private_apps : airspace;
	await target.batch((b) => {
		for (const record of present) b.playgrounds.delete(record.rkey);
	});
}

export async function create(
	origin: string,
	user: AtprotoSessionUser,
	input: Input,
	is_private: boolean
) {
	is_private &&= user.private_apps;
	const airspace = await own(origin, user);
	const value = to_value(input);
	const { rkey } = await home(airspace, is_private).create(value);
	invalidate_public(user.did);
	return to_gist(user, rkey, value, is_private);
}

/** Saves in place; moving an app between public and private is a copy, then a delete. */
export async function update(origin: string, user: AtprotoSessionUser, id: string, input: Input) {
	const { repo, rkey } = split(id);
	if (!(await owner_of(user, repo))) error(403, 'not your app');
	const airspace = await own(origin, user);

	const [pub, priv] = await Promise.all([
		airspace.playgrounds.get(rkey),
		user.private_apps ? airspace.private_apps.playgrounds.get(rkey) : null
	]);
	const existing = pub ?? priv;
	if (!existing) error(404, 'not found');

	await home(airspace, !pub).put(rkey, to_value(input, existing.value.createdAt));
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
	await remove_all(airspace, false, rkeys);
	if (user.private_apps) await remove_all(airspace, true, rkeys);
	invalidate_public(user.did);
}

/** Idempotent: an existing space is one read and success. Only the owner is a member. */
export async function enable_private(airspace: Airspace) {
	await airspace.private_apps.manage.ensure({
		read: 'member-list',
		write: 'member-list',
		appAccess: 'open'
	});
}

/** Deletes the space and every private app in it. */
export async function disable_private(origin: string, user: AtprotoSessionUser) {
	const airspace = await own(origin, user);
	await airspace.private_apps.manage.delete();
}
