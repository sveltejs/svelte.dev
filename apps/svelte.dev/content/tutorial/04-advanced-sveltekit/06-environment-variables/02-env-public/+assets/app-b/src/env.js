import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	THEME_BACKGROUND: {
		public: true
	},
	THEME_FOREGROUND: {
		public: true
	}
});
