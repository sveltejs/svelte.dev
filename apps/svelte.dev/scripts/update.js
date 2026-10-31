import { fork } from 'node:child_process';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('.', import.meta.url));

/** @type {NodeJS.ProcessEnv} */
const env = {
	FORCE_UPDATE: process.argv.includes('--force=true') ? 'true' : '',
	ALLOW_FALLBACK: process.argv.includes('--fallback=true') ? 'true' : ''
};

// these need the rest of the environment too (e.g. GITHUB_TOKEN)
const supporters = { execArgv: ['--env-file=.env'], env: { ...process.env, ...env } };

for (const script of ['get_contributors.js', 'get_donors.js']) {
	fork(`${dir}/${script}`, supporters).on('exit', (code) => {
		if (code) process.exitCode = code;
	});
}
fork(`${dir}/get_svelte_template.js`, { env });
