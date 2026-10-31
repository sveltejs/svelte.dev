import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('.', import.meta.url));

/** @type {NodeJS.ProcessEnv} */
const env = {
	FORCE_UPDATE: process.argv.includes('--force=true') ? 'true' : ''
};

// these need the rest of the environment too (e.g. GITHUB_TOKEN)
const supporters = { execArgv: ['--env-file=.env'], env: { ...process.env, ...env } };

fork(`${dir}/get_contributors.js`, supporters);
fork(`${dir}/get_donors.js`, supporters);
fork(`${dir}/get_svelte_template.js`, { env });
