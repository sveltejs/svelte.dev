import { dev } from '$app/env';
import fs from 'node:fs';
import path from 'node:path';
import { client } from './client.js';

// Dev-only stand-in for the Supabase rpcs, so GitHub login and saving work without a database.

/** @typedef {import('./types').GitHubUser} GitHubUser */
/** @typedef {import('./types').User} User */
/** @typedef {import('./types').Gist & { userid: number, created_at: string, updated_at: string, deleted_at?: string }} Row */

const FILE = path.resolve('tmp/playground.json');
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const enabled = dev && !client;

function load() {
	try {
		return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
	} catch {
		return { users: {}, sessions: {}, gists: {} };
	}
}

/** @param {{ users: Record<string, User & { github_id: string }>, sessions: Record<string, { userid: number, expires: number }>, gists: Record<string, Row> }} db */
function save(db) {
	fs.mkdirSync(path.dirname(FILE), { recursive: true });
	fs.writeFileSync(FILE, JSON.stringify(db, null, '\t'));
}

/** @param {GitHubUser} user */
export function login(user) {
	const db = load();
	let existing = Object.values(db.users).find((u) => u.github_id === user.github_id);
	if (!existing) {
		existing = { id: Object.keys(db.users).length + 1, ...user };
		db.users[existing.id] = existing;
	} else {
		Object.assign(existing, user);
	}
	const sessionid = crypto.randomUUID();
	const expires = Date.now() + SESSION_TTL_MS;
	db.sessions[sessionid] = { userid: existing.id, expires };
	save(db);
	return { sessionid, userid: existing.id, expires };
}

/** @param {string} sessionid */
export function get_user(sessionid) {
	const db = load();
	const s = db.sessions[sessionid];
	if (!s || s.expires < Date.now()) return null;
	const { github_id, ...user } = db.users[s.userid];
	return user;
}

/** @param {string} sessionid */
export function logout(sessionid) {
	const db = load();
	delete db.sessions[sessionid];
	save(db);
}

/** @param {number} userid @param {string} search */
export function gist_list(userid, search) {
	const q = search.toLowerCase();
	return Object.values(load().gists)
		.filter((g) => g.userid === userid && !g.deleted_at && g.name.toLowerCase().includes(q))
		.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** @param {number} userid @param {Pick<Row, 'name'|'files'|'tailwind'>} gist */
export function gist_create(userid, gist) {
	const db = load();
	const now = new Date().toISOString();
	const row = {
		id: crypto.randomUUID(),
		name: gist.name,
		files: gist.files,
		tailwind: gist.tailwind ?? false,
		userid,
		owner: userid,
		created_at: now,
		updated_at: now
	};
	db.gists[row.id] = row;
	save(db);
	return row;
}

/** @param {string} id */
export function gist_read(id) {
	const g = Object.values(load().gists).find(
		(g) => g.id.replace(/-/g, '') === id.replace(/-/g, '')
	);
	return g && !g.deleted_at ? g : undefined;
}

/** @param {number} userid @param {string} id @param {Pick<Row, 'name'|'files'|'tailwind'>} gist */
export function gist_update(userid, id, gist) {
	const db = load();
	const row = Object.values(db.gists).find((g) => g.id.replace(/-/g, '') === id.replace(/-/g, ''));
	if (!row || row.userid !== userid) throw new Error('not found');
	Object.assign(row, { name: gist.name, files: gist.files, tailwind: gist.tailwind ?? false });
	row.updated_at = new Date().toISOString();
	save(db);
	return row;
}

/** @param {number} userid @param {string[]} ids */
export function gist_destroy(userid, ids) {
	const db = load();
	const wanted = new Set(ids.map((id) => id.replace(/-/g, '')));
	for (const row of Object.values(db.gists)) {
		if (row.userid === userid && wanted.has(row.id.replace(/-/g, ''))) {
			row.deleted_at = new Date().toISOString();
		}
	}
	save(db);
}
