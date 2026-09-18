import { client } from '#lib/db/client.js';
import * as local from '#lib/db/dev.js';

// Server-side key/value store for OAuth state, sessions, logins and profiles.
// Prod: one Supabase table `atproto_kv (key text primary key, value jsonb, updated_at timestamptz)`.
// Dev without Supabase: the same JSON file as the GitHub stand-in.

export async function get<T>(key: string): Promise<T | undefined> {
	if (local.enabled) return local.kv_get(key) as T | undefined;
	if (!client) return undefined;
	const { data, error } = await client
		.from('atproto_kv')
		.select('value')
		.eq('key', key)
		.maybeSingle();
	if (error) throw new Error(error.message);
	return (data?.value ?? undefined) as T | undefined;
}

export async function set(key: string, value: unknown) {
	if (local.enabled) return local.kv_set(key, value);
	if (!client) throw new Error('Database client is not configured');
	const { error } = await client
		.from('atproto_kv')
		.upsert({ key, value, updated_at: new Date().toISOString() });
	if (error) throw new Error(error.message);
}

export async function del(key: string) {
	if (local.enabled) return local.kv_del(key);
	if (!client) return;
	const { error } = await client.from('atproto_kv').delete().eq('key', key);
	if (error) throw new Error(error.message);
}

const SWEEP_AFTER_MS = 60 * 24 * 60 * 60 * 1000;
const SWEEP_EVERY_MS = 60 * 60 * 1000;
let last_sweep = 0;

/**
 * Drops rows untouched for 60 days. Logins expire at 30 and every other row is rewritten
 * on login, so nothing older is reachable. Called on login, at most hourly per process.
 */
export async function sweep() {
	if (local.enabled || !client || Date.now() - last_sweep < SWEEP_EVERY_MS) return;
	last_sweep = Date.now();
	const cutoff = new Date(Date.now() - SWEEP_AFTER_MS).toISOString();
	const { error } = await client.from('atproto_kv').delete().lt('updated_at', cutoff);
	if (error) console.warn(`atproto_kv sweep: ${error.message}`);
}

/** A namespaced view, in the shape `@atproto/oauth-client-node` stores want. */
export function scoped<T>(prefix: string) {
	return {
		get: (key: string) => get<T>(`${prefix}:${key}`),
		set: (key: string, value: T) => set(`${prefix}:${key}`, value),
		del: (key: string) => del(`${prefix}:${key}`)
	};
}
