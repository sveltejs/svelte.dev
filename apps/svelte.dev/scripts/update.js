import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('.', import.meta.url));

const env = {
	FORCE_UPDATE: process.argv.includes('--force=true') || ''
};

fork(`${dir}/get_contributors.js`, { env });
fork(`${dir}/get_donors.js`, { env });
fork(`${dir}/get_svelte_template.js`, { env });
