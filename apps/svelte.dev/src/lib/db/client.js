import { building } from '$app/env';
import { SUPABASE_URL, SUPABASE_KEY } from '$app/env/private';
import { createClient } from '@supabase/supabase-js';

if (!building && (!SUPABASE_URL || !SUPABASE_KEY)) {
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
	SUPABASE_URL &&
	SUPABASE_KEY &&
	createClient(SUPABASE_URL, SUPABASE_KEY, {
		global: { fetch },
		auth: { persistSession: false }
	});
