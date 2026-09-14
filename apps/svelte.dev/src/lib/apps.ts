import { is_auth_error } from '#lib/atproto/auth.js';
import * as at_gist from '#lib/atproto/gist.js';
import type { Accounts, Gist } from '#lib/db/types.d.ts';
import type { Destination } from '#lib/destination.js';

// Browser-side: GitHub apps go through our API, atproto apps straight to the user's PDS

type Input = { name: string; tailwind?: boolean; files: Gist['files'] };

/** Expired atproto session: log in again (popup) and retry once. */
export async function with_reauth<T>(fn: () => Promise<T>, login: () => Promise<void>) {
	try {
		return await fn();
	} catch (e) {
		if (!is_auth_error(e)) throw e;
		await login();
		return fn();
	}
}

async function ok(r: Response) {
	if (!r.ok) throw new Error(`Received an HTTP ${r.status} response`);
	return r;
}

async function read(id: string, accounts: Accounts): Promise<Input | null> {
	if (id.includes('/')) {
		const r = await fetch(`/playground/api/at/${id}`);
		if (r.ok) return r.json();
		if (r.status !== 404 || !accounts.atproto) return null;
		return at_gist.read_private(accounts.atproto, id);
	}
	const r = await fetch(`/playground/api/${id}.json`);
	if (!r.ok) return null;
	const app = await r.json();
	return {
		name: app.name,
		tailwind: app.tailwind,
		files: app.components.map((c: { name: string; type: string; source: string }) => ({
			name: `${c.name}.${c.type}`,
			type: c.type,
			source: c.source
		}))
	};
}

export async function create(
	input: Input & { svelte_version?: string },
	destination: Destination,
	accounts: Accounts
): Promise<Gist> {
	const body = { ...input, files: input.files.map((f) => ({ name: f.name, source: f.source })) };
	if (destination === 'github') {
		const r = await fetch('/playground/create.json', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!r.ok) {
			const { error } = await r.json();
			throw new Error(`Received an HTTP ${r.status} response: ${error}`);
		}
		return r.json();
	}
	if (!accounts.atproto) throw new Error('not logged in');
	return at_gist.create(accounts.atproto, {
		...body,
		private: destination === 'atproto-private'
	});
}

export async function update(
	id: string,
	input: Input & { svelte_version?: string },
	accounts: Accounts
) {
	const body = { ...input, files: input.files.map((f) => ({ name: f.name, source: f.source })) };
	if (id.includes('/')) {
		if (!accounts.atproto) throw new Error('not logged in');
		return at_gist.update(accounts.atproto, id, body);
	}
	const r = await fetch(`/playground/save/${id}`, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!r.ok) {
		const { error } = await r.json();
		throw new Error(`Received an HTTP ${r.status} response: ${error}`);
	}
}

/** Copies apps to a destination; the originals are untouched. */
export async function copy(ids: string[], destination: Destination, accounts: Accounts) {
	for (const id of ids) {
		const app = await read(id, accounts);
		if (!app) throw new Error(`${id} not found`);
		await create(
			{ name: app.name, tailwind: app.tailwind ?? false, files: app.files },
			destination,
			accounts
		);
	}
}

export async function destroy(ids: string[], accounts: Accounts) {
	const at_ids = ids.filter((id) => id.includes('/'));
	const gh_ids = ids.filter((id) => !id.includes('/'));

	if (gh_ids.length) {
		await ok(
			await fetch('/apps/destroy', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ ids: gh_ids })
			})
		);
	}
	if (at_ids.length) {
		if (!accounts.atproto) throw new Error('not logged in');
		await at_gist.destroy(accounts.atproto, at_ids);
	}
}
