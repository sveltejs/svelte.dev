import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

if (!building && (!env.SUPABASE_URL || !env.SUPABASE_KEY)) {
	console.warn(
		`Missing SUPABASE_URL and SUPABASE_KEY environment variables. Loading and saving in the playground is disabled`
	);
}

/**
 * @type {import('@supabase/supabase-js').SupabaseClient<any, "public", any>}
 */
// @ts-ignore-line
export const client =
	!building &&
	env.SUPABASE_URL &&
	env.SUPABASE_KEY &&
	createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
		global: { fetch },
		auth: { persistSession: false }
	});
