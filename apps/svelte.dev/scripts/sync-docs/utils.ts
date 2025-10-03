import { execSync, spawn, type SpawnOptions } from 'node:child_process';
import fs from 'node:fs';
import glob from 'tiny-glob/sync.js';

export async function clone_repo(repo: string, name: string, branch: string, cwd: string) {
	const dir = `${cwd}/${name}`;

	if (fs.existsSync(dir)) {
		const opts = { cwd: dir };

		if (!repo.startsWith('sveltejs/')) {
			console.warn('Ignoring --owner flag for already-cloned repo');
		}

		if (execSync('git status -s', opts).toString() !== '') {
			throw new Error(`${name} repo is dirty — aborting`);
		}

		await invoke('git', ['checkout', branch], opts);
		await invoke('git', ['pull'], opts);

		return;
	}

	await invoke('git', ['clone', '--depth', '1', '--branch', branch, repo], {
		cwd
	});
}

export function invoke(cmd: string, args: string[], opts: SpawnOptions) {
	const child = spawn(cmd, args, { ...opts, stdio: 'inherit' });

	return new Promise<void>((fulfil, reject) => {
		child.on('close', (code) => {
			if (code) {
				reject(new Error(`Exited with code ${code}`));
				return;
			}

			// Give it some extra time to finish writing files to disk
			setTimeout(fulfil, 500);
		});
	});
}

/** Older versions of the documentation did use meta.json instead of index.md */
export function migrate_meta_json(path: string) {
	const files = glob(`${path}/**/meta.json`);
	for (const file of files) {
		const content = fs.readFileSync(file, 'utf-8');
		const meta = JSON.parse(content);
		const new_content = `---\n${Object.entries(meta)
			.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
			.join('\n')}\n---`;
		fs.rmSync(file);
		fs.writeFileSync(file.replace('meta.json', 'index.md'), new_content);
	}
}
