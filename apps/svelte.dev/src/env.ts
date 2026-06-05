import { defineEnvVars } from '@sveltejs/kit/hooks';
import * as v from 'valibot';

export const variables = defineEnvVars({
	SUPABASE_URL: {},
	SUPABASE_KEY: {},
	GITHUB_CLIENT_ID: {},
	GITHUB_CLIENT_SECRET: {},
	LOCAL_SVELTE_PATH: {
		schema: v.optional(v.string(), '')
	},
	PRERENDER: {
		static: true
	}
});
