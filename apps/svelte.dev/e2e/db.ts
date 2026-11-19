import fs from 'node:fs';
import path from 'node:path';

// tests cannot sign in through GitHub so they write to the file the server reads when LOCAL_DATABASE is true
const file = path.resolve(import.meta.dirname, '../tmp/playground.json');

export const session_id = 'e2e-session';

/** signing out destroys a session so every attempt needs its own */
export const disposable_session_ids = Array.from({ length: 20 }, (_, i) => `e2e-session-${i}`);

export const user = {
	id: 987654321,
	github_id: 'e2e',
	github_name: 'Test User',
	github_login: 'test-user',
	github_avatar_url:
		'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E'
};

function read() {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch {
		return { users: {}, sessions: {}, gists: {} };
	}
}

function write(db: unknown) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify(db, null, '\t'));
}

/** removes the test user and everything they own */
export function cleanup() {
	if (!fs.existsSync(file)) return;

	const db = read();

	delete db.users[user.id];
	for (const id of [session_id, ...disposable_session_ids]) {
		delete db.sessions[id];
	}

	for (const id in db.gists) {
		if (db.gists[id].userid === user.id) delete db.gists[id];
	}

	write(db);
}

export function seed() {
	cleanup();

	const db = read();

	db.users[user.id] = user;
	for (const id of [session_id, ...disposable_session_ids]) {
		db.sessions[id] = { userid: user.id, expires: Date.now() + 24 * 60 * 60 * 1000 };
	}

	write(db);
}
