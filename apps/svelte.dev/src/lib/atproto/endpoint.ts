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

const FileSchema = v.message(
	v.object({
		name: v.string(),
		source: v.string()
	}),
	'each file needs a name and a source'
);

const InputSchema = v.message(
	v.pipe(
		v.object({
			name: v.string(),
			files: v.pipe(
				v.array(FileSchema),
				v.maxLength(MAX_FILES, `an app holds at most ${MAX_FILES} files`)
			),
			tailwind: v.optional(v.boolean()),
			svelte_version: v.optional(v.string()),
			async: v.optional(v.boolean()),
			forked_from: v.optional(v.string())
		}),
		v.check(
			(input) => input.files.reduce((total, file) => total + file.source.length, 0) <= MAX_BYTES,
			`an app holds at most ${MAX_BYTES} characters`
		)
	),
	'name and files are required'
);

export function parse_input(body: unknown): Input {
	const result = v.safeParse(InputSchema, body);
	if (!result.success) error(400, result.issues[0].message);
	return result.output;
}
