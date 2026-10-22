import type { Gist } from '#lib/db/types.d.ts';
import type { Destination } from '#lib/destination.js';

// Browser-side. atproto ids are `<handle-or-did>/<rkey>`

// no `.`/`..` segment: page loads fetch these server-side with the viewer's cookies
const AT_ID_REGEX = /^[a-z0-9][a-z0-9.:_%-]*\/[a-z0-9_:~-][a-z0-9._:~-]*$/i;

type Input = Pick<Gist, 'name' | 'tailwind' | 'svelte_version' | 'async' | 'forked_from' | 'files'>;

class HttpError extends Error {
	status: number;
	constructor(status: number, detail?: string) {
		super(`Received an HTTP ${status} response${detail ? `: ${detail}` : ''}`);
		this.status = status;
	}
}

/** Expired atproto session: log in again (popup) and retry once. */
export async function with_reauth<T>(fn: () => Promise<T>, login: () => Promise<void>) {
	try {
		return await fn();
	} catch (e) {
		if (!(e instanceof HttpError) || e.status !== 401) throw e;
		await login();
		return fn();
	}
}

async function send(url: string, method: string, body?: unknown) {
	const r = await fetch(url, {
		method,
		credentials: 'include',
		headers: body ? { 'content-type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined
	});
	if (!r.ok) {
		const detail = await r
			.json()
			.then((j) => j?.error ?? j?.message)
			.catch(() => undefined);
		throw new HttpError(r.status, detail);
	}
	return r;
}

function is_atproto(id: string) {
	return id.includes('/');
}

function at_path(id: string) {
	if (!AT_ID_REGEX.test(id)) return null;
	const slash = id.indexOf('/');
	return `${encodeURIComponent(id.slice(0, slash))}/${encodeURIComponent(id.slice(slash + 1))}`;
}

/** Null for an id that cannot be one. */
export function api_url(id: string) {
	if (!is_atproto(id)) return `/playground/api/${encodeURIComponent(id)}.json`;
	const path = at_path(id);
	return path && `/playground/api/at/${path}`;
}

// a private source is not linked from a copy that may be public
export function fork_source(source: Pick<Gist, 'id' | 'owner' | 'private'>) {
	if (source.id === 'untitled' || source.private) return undefined;
	if (!is_atproto(source.id)) return `https://svelte.dev/playground/${source.id}`;
	const rkey = source.id.slice(source.id.indexOf('/') + 1);
	return `at://${source.owner}/dev.svelte.playground/${rkey}`;
}

async function read(id: string): Promise<Input & Pick<Gist, 'id' | 'owner' | 'private'>> {
	const url = api_url(id);
	if (!url) throw new HttpError(404);
	const r = await send(url, 'GET');
	const app = await r.json();
	return {
		id: app.id,
		owner: app.owner,
		private: app.private,
		name: app.name,
		tailwind: app.tailwind,
		svelte_version: app.svelte_version,
		async: app.async,
		forked_from: app.forked_from,
		files: app.components.map((c: { name: string; type: string; source: string }) => ({
			name: c.type ? `${c.name}.${c.type}` : c.name,
			type: c.type,
			source: c.source
		}))
	};
}

// a read app carries more (id, owner, private)
function body({ name, tailwind, svelte_version, async, forked_from, files }: Input) {
	return {
		name,
		tailwind,
		svelte_version,
		async,
		forked_from,
		files: files.map((f) => ({ name: f.name, source: f.source }))
	};
}

export async function create(input: Input, destination: Destination): Promise<Gist> {
	if (destination === 'github') {
		return (await send('/playground/create.json', 'POST', body(input))).json();
	}
	return (
		await send('/playground/at/create.json', 'POST', {
			...body(input),
			private: destination === 'atproto-private'
		})
	).json();
}

export async function update(id: string, input: Input) {
	let url = `/playground/save/${encodeURIComponent(id)}`;
	if (is_atproto(id)) {
		const path = at_path(id);
		if (!path) throw new HttpError(404);
		url = `/playground/at/save/${path}`;
	}
	await send(url, 'PUT', body(input));
}

// reauth per app, so a retry after an expired session never copies one twice
export async function copy(
	ids: string[],
	destination: Destination,
	login: () => Promise<void>,
	done: (id: string) => void
) {
	for (const id of ids) {
		await with_reauth(async () => {
			const app = await read(id);
			await create(
				{ ...app, tailwind: app.tailwind ?? false, forked_from: fork_source(app) },
				destination
			);
		}, login);
		done(id);
	}
}

export async function destroy(ids: string[]) {
	const at_ids = ids.filter(is_atproto);
	const gh_ids = ids.filter((id) => !is_atproto(id));

	if (gh_ids.length) await send('/apps/destroy', 'POST', { ids: gh_ids });
	if (at_ids.length) await send('/apps/at/destroy', 'POST', { ids: at_ids });
}
