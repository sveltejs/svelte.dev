import type { Cookies } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { ValidationError } from 'airspace';
import type { AtprotoSessionUser } from '#lib/db/types.d.ts';
import { SessionError } from './client.js';
import type { Input } from './apps.js';
import * as session from './session.js';

/**
 * Runs `fn` as the logged-in user. A dead OAuth session logs the user out and answers 401
 * so the client re-runs login and retries; a record that fails the lexicon is a 400.
 */
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

// the lexicon caps each file; these cap the request before it reaches the PDS
const MAX_FILES = 100;
const MAX_BYTES = 1_000_000;

export function parse_input(body: unknown): Input {
	const b = body as Partial<Input> | null;
	if (typeof b?.name !== 'string' || !Array.isArray(b.files)) {
		error(400, 'name and files are required');
	}
	if (b.files.length > MAX_FILES) error(400, `an app holds at most ${MAX_FILES} files`);
	const bytes = b.files.reduce((total, f) => total + (f?.source?.length ?? 0), 0);
	if (bytes > MAX_BYTES) error(400, `an app holds at most ${MAX_BYTES} characters`);

	return {
		name: b.name,
		files: b.files,
		...(b.tailwind ? { tailwind: true } : {}),
		...(typeof b.svelte_version === 'string' ? { svelte_version: b.svelte_version } : {})
	};
}
