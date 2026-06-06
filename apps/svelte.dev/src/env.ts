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
		static: true
	}
});
