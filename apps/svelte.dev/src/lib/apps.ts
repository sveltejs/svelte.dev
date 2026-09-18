import type { Gist } from '#lib/db/types.d.ts';
import type { Destination } from '#lib/destination.js';

// Browser-side. Everything goes through our API; atproto ids contain a `/`

type Input = { name: string; tailwind?: boolean; svelte_version?: string; files: Gist['files'] };

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

async function read(id: string): Promise<Input> {
	const r = await send(
		is_atproto(id) ? `/playground/api/at/${id}` : `/playground/api/${id}.json`,
		'GET'
	);
	const app = await r.json();
	return {
		name: app.name,
		tailwind: app.tailwind,
		svelte_version: app.svelte_version,
		files: app.components.map((c: { name: string; type: string; source: string }) => ({
			name: `${c.name}.${c.type}`,
			type: c.type,
			source: c.source
		}))
	};
}

function body(input: Input) {
	return { ...input, files: input.files.map((f) => ({ name: f.name, source: f.source })) };
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
	await send(
		is_atproto(id) ? `/playground/at/save/${id}` : `/playground/save/${id}`,
		'PUT',
		body(input)
	);
}

/**
 * Copies apps to a destination; the originals are untouched. Each app reauths on its own,
 * so a session that expires halfway through does not copy the earlier ones twice.
 */
export async function copy(ids: string[], destination: Destination, login: () => Promise<void>) {
	for (const id of ids) {
		await with_reauth(async () => {
			const app = await read(id);
			await create({ ...app, tailwind: app.tailwind ?? false }, destination);
		}, login);
	}
}

export async function destroy(ids: string[]) {
	const at_ids = ids.filter(is_atproto);
	const gh_ids = ids.filter((id) => !is_atproto(id));

	if (gh_ids.length) await send('/apps/destroy', 'POST', { ids: gh_ids });
	if (at_ids.length) await send('/apps/at/destroy', 'POST', { ids: at_ids });
}
