import type { Cookies } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { ValidationError } from 'airspace';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import { SessionError } from './client.js';
import type { Input } from './apps.js';
import * as session from './session.js';

/** A dead OAuth session logs out and answers 401, so the client logs in again and retries. */
export async function with_user<T>(
	cookies: Cookies,
	fn: (user: AtprotoSessionUser, sid: string) => Promise<T>
): Promise<T> {
	const sid = cookies.get(session.COOKIE);
	const user = await session.read(sid);
	if (!sid || !user) error(401);

	try {
		return await fn(user, sid);
	} catch (e) {
		if (e instanceof SessionError) {
			await session.destroy(sid);
			session.clear_cookie(cookies);
			error(401, 'Session expired');
		}
		if (e instanceof ValidationError) error(400, e.message);
		throw e;
	}
}

/** Read inside `with_user`, so a stranger's body is never parsed. */
export async function json_body(request: Request): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		error(400, 'invalid JSON');
	}
}

// the lexicon caps each file; these cap the request before it reaches the PDS
const MAX_FILES = 100;
const MAX_BYTES = 1_000_000;

function is_file(f: unknown): f is Input['files'][number] {
	const file = f as Partial<Input['files'][number]> | null;
	return typeof file?.name === 'string' && typeof file.source === 'string';
}

export function parse_input(body: unknown): Input {
	const b = body as Partial<Input> | null;
	if (typeof b?.name !== 'string' || !Array.isArray(b.files)) {
		error(400, 'name and files are required');
	}
	if (b.files.length > MAX_FILES) error(400, `an app holds at most ${MAX_FILES} files`);
	if (!b.files.every(is_file)) error(400, 'each file needs a name and a source');
	const bytes = b.files.reduce((total, f) => total + f.source.length, 0);
	if (bytes > MAX_BYTES) error(400, `an app holds at most ${MAX_BYTES} characters`);

	return {
		name: b.name,
		files: b.files,
		tailwind: b.tailwind === true,
		svelte_version: typeof b.svelte_version === 'string' ? b.svelte_version : undefined,
		async: typeof b.async === 'boolean' ? b.async : undefined,
		forked_from: typeof b.forked_from === 'string' ? b.forked_from : undefined
	};
}
