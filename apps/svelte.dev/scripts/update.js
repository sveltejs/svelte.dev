import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('.', import.meta.url));

/** @type {NodeJS.ProcessEnv} */
const env = {
	FORCE_UPDATE: process.argv.includes('--force=true') ? 'true' : ''
};

fork(`${dir}/get_contributors.js`, { execArgv: ['--env-file=.env'] });
fork(`${dir}/get_donors.js`, { execArgv: ['--env-file=.env'] });
fork(`${dir}/get_svelte_template.js`, { env });
