#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

process.chdir('../../..');

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
	child.stdout.on('data', console.log);
	child.stderr.on('data', console.error);
}
