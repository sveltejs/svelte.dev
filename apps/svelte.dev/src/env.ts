import { VERSION } from '@sveltejs/kit';
import { defineEnvVars } from '@sveltejs/kit/hooks';
import * as v from 'valibot';

export const variables = defineEnvVars({
	SUPABASE_URL: {
		schema: v.optional(v.string())
	},
	SUPABASE_KEY: {
		schema: v.optional(v.string())
	},
	GITHUB_CLIENT_ID: {
		schema: v.optional(v.string())
	},
	GITHUB_CLIENT_SECRET: {
		schema: v.optional(v.string())
	},
	LOCAL_SVELTE_PATH: {
		schema: v.optional(v.string(), '')
	},
	PRERENDER: {
		static: true as any, // TODO: remove this when we stop deploying previews for Kit 2
		availability: 'inline'
	}
});

// TODO: remove this when we stop deploying previews for Kit 2
if (VERSION[0] === '3') {
	// we throw a migration error when this is set
	delete variables.PRERENDER.static;
}
