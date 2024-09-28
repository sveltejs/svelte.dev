import { spawn, type SpawnOptions } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import glob from 'tiny-glob/sync';

export async function clone_repo(repo: string, cwd: string) {
	const regex_result = /https:\/\/github.com\/\w+\/(\w+).git/.exec(repo);
	if (!regex_result || regex_result.length < 2) {
		throw new Error(`Expected https://github.com/xxx/xxx.git, but got ${repo}`);
	}

	const dirname = `${cwd}/${regex_result[1]}`;
	if (fs.existsSync(dirname)) {
		// TODO skip if we detect that same branch is already cloned
		fs.rmSync(dirname, { recursive: true });
	}

	await invoke('git', ['clone', '--depth', '1', repo], {
		cwd
	});
}

export function invoke(cmd: string, args: string[], opts: SpawnOptions) {
	const child = spawn(cmd, args, { ...opts, stdio: 'inherit' });

	return new Promise<void>((resolve) => {
		child.on('close', (code) => {
			if (!code) {
				console.log(`${[cmd, ...args].join(' ')} successfully completed`);
			}

			// Give it some extra time to finish writing files to disk
			setTimeout(() => resolve(), 500);
		});
	});
}

export function replace_strings(obj: any, replace: (str: string) => string) {
	for (let key in obj) {
		if (typeof obj[key] === 'object') {
			replace_strings(obj[key], replace);
		} else if (typeof obj[key] === 'string') {
			obj[key] = replace(obj[key]);
		}
	}
}

/**
 * Type declarations include fully qualified URLs so that they become links when
 * you hover over names in an editor with TypeScript enabled. We need to remove
 * the origin so that they become root-relative, so that they work in preview
 * deployments and when developing locally
 */
export function strip_origin(str: string) {
	return str.replace(/https:\/\/(kit\.)?svelte\.dev/g, '');
}

export function write(file: string, content: string) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
	} catch {
		// ignore
	}

	fs.writeFileSync(file, content);
}
