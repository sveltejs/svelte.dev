#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

let cwd = process.cwd();
while ((cwd.match(/svelte.dev/g) || []).length > 0) {
	process.chdir('..');
	cwd = process.cwd();
}

cloneRepo('git@github.com:sveltejs/svelte.git');
cloneRepo('git@github.com:sveltejs/kit.git');

function cloneRepo(repo) {
	const dirname = /git@github.com:\w+\/(\w+).git/.exec(repo)[1];
	if (existsSync(dirname)) {
		return console.log(`${dirname} exists. skipping git clone`);
	}
	invoke('git', ['clone', '--depth', '1', repo]);
}

function invoke(cmd, args) {
	const child = spawn(cmd, args);
	child.stdout.on('data', (data) => console.log(data.toString()));
	child.stderr.on('data', (data) => console.error(data.toString()));
	child.on('close', (code) => {
		if (!code) {
			console.log(`${[cmd, ...args].join(' ')} successfully completed`);
		}
	});
}
