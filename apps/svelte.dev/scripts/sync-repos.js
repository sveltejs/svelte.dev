#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

// allow running this script from multiple locations
let cwd = process.cwd();

while (
	(cwd.match(/svelte.dev/g) || []).length > 1 ||
	(!cwd.endsWith('svelte.dev') && !cwd.includes('/vercel/'))
) {
	process.chdir('..');
	cwd = process.cwd();
}

// we need to checkout the repos within an ignored directory of this one
// we cannot create files outside the root of this project on the vercel deployment host
try {
	mkdirSync('repos');
} catch {
	// ignore if it already exists
}
process.chdir('repos');

cloneRepo('https://github.com/sveltejs/svelte.git');
cloneRepo('https://github.com/sveltejs/kit.git');

/**
 * @param {string} repo
 */
function cloneRepo(repo) {
	const regex_result = /https:\/\/github.com\/\w+\/(\w+).git/.exec(repo);
	if (!regex_result || regex_result.length < 2) {
		throw new Error(`Expected https://github.com/xxx/xxx.git, but got ${repo}`);
	}
	const dirname = regex_result[1];
	if (existsSync(dirname)) {
		return console.log(`${dirname} exists. skipping git clone`);
	}
	invoke('git', ['clone', '--depth', '1', repo]);
}

/**
 * @param {string} cmd
 * @param {string[]} args
 * @return {Promise<void>}
 */
function invoke(cmd, args) {
	const child = spawn(cmd, args);
	child.stdout.on('data', (data) => console.log(data.toString()));
	child.stderr.on('data', (data) => console.error(data.toString()));
	return new Promise((resolve) => {
		child.on('close', (code) => {
			if (!code) {
				console.log(`${[cmd, ...args].join(' ')} successfully completed`);
			}
			resolve();
		});
	});
}
