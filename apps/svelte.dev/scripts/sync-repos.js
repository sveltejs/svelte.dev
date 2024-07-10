#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path'

const cwd = process.cwd();
if (cwd.endsWith(join('apps', 'svelte.dev'))) {
	process.chdir('../../..');
} else if (cwd.endsWith('svelte.dev')) {
	process.chdir('..');
} else {
	throw new Error('script run from unsupported directory');
}

cloneRepo('git@github.com:sveltejs/svelte.git');
cloneRepo('git@github.com:sveltejs/kit.git');

function cloneRepo(repo) {
	const dirname = /git@github.com:\w+\/(\w+).git/.exec(repo)[1]
	if (existsSync(dirname)) {
		return console.log(`${dirname} exists. skipping git clone`);
	}
	invoke('git', ['clone', repo])
}

function invoke(cmd, args) {
	const child = spawn(cmd, args);
	child.stdout.on('data', (data) => console.log(data.toString()));
	child.stderr.on('data', (data) => console.error(data.toString()));
}
