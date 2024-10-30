import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

const enabled = !building && env.SUPABASE_URL && env.SUPABASE_KEY;

if (!enabled) {
	console.warn(
		`Missing SUPABASE_URL and SUPABASE_KEY environment variables. Loading and saving in the playground is disabled`
	);
}

/**
 * @type {import('@supabase/supabase-js').SupabaseClient<any, "public", any>}
 */
// @ts-ignore-line
export const client =
	enabled &&
	createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
		global: { fetch },
		auth: { persistSession: false }
	});
