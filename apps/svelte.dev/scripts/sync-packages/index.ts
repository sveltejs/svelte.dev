import { PACKAGES_META } from '../../src/lib/packages-meta.ts';
import type { PackageKey, PackageNpm, PackageGithub } from '../../src/lib/server/content.ts';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

let skipGithubStars = false;

const start = performance.now();
console.log('[sync-packages] start');

let logsAtTheEnd: {
	type:
		| 'no_repo_url'
		| 'low_downloads'
		| 'low_github_stars'
		| 'new_json_file'
		| 'deleted_unused_json_file'
		| 'outdated'
		| 'deprecated'
		| 'npm_error';
	pkg: string;
	extra: string;
}[] = [];

const packages = PACKAGES_META.FEATURED.flatMap((pkg) => pkg.packages).map((pkg) => pkg.name);

const registryFolder = 'src/lib/server/generated/registry';

// PART 1: create missing json files
for (const pkg of packages) {
	const cleanPkg = pkg.replace('@', '').replace('/', '-');
	const jsonPath = path.join(registryFolder, `${cleanPkg}.json`);
	if (!fs.existsSync(jsonPath)) {
		const p = await getNpmAndGitHubData(pkg);
		writeJsonData(jsonPath, p);
		logsAtTheEnd.push({ type: 'new_json_file', pkg, extra: `created -> ${jsonPath}` });
	}
}

// PART 2: delete unused json files
let registryJsonFiles = fs.readdirSync(registryFolder);
const jsonUsed: string[] = [];
for (const pkg of packages) {
	const cleanPkg = pkg.replace('@', '').replace('/', '-');
	const cleanPkgFile = `${cleanPkg}.json`;
	const jsonPath = path.join(registryFolder, cleanPkgFile);
	if (fs.existsSync(jsonPath)) {
		jsonUsed.push(cleanPkgFile);
	}
}
const jsonNotNeeded = registryJsonFiles.filter((pkg) => !jsonUsed.includes(pkg));
if (jsonNotNeeded.length > 0) {
	// delete json files
	for (const pkg of jsonNotNeeded) {
		const jsonPath = path.join(registryFolder, pkg);
		fs.unlinkSync(jsonPath);
		logsAtTheEnd.push({ type: 'deleted_unused_json_file', pkg, extra: `deleted -> ${jsonPath}` });
	}

	// Let's continue
	// theEnd(1);
}

// PART 3: refresh data
registryJsonFiles = fs.readdirSync(registryFolder); //.slice(0, 20);

const batch = 10;
for (let i = 0; i < registryJsonFiles.length; i += batch) {
	const batchFiles = registryJsonFiles.slice(i, i + batch);
	await Promise.all(
		batchFiles.map(async (pkg) => {
			await refreshJsonFile(path.join(registryFolder, pkg));
		})
	);
}

theEnd(0);

// HELPERS

function theEnd(val: number) {
	const msg = ['[sync-packages]'];
	if (val > 0) {
		msg.push(`exit(${val}) - `);
	}
	msg.push(`took: ${(performance.now() - start).toFixed(0)}ms`);
	console.log(msg.join(' '));
	if (logsAtTheEnd.length > 0) {
		console.log('[sync-packages] report:');
		const typePrints: Record<(typeof logsAtTheEnd)[number]['type'], string> = {
			no_repo_url: 'No GitHub URL',
			low_downloads: 'Low Downloads',
			low_github_stars: 'Low Stars',
			new_json_file: 'NEW JSON',
			deleted_unused_json_file: 'DEL JSON',
			outdated: 'Outdated',
			deprecated: 'Deprecated',
			npm_error: 'NPM Error'
		};
		console.log(
			`  - ${logsAtTheEnd.map((l) => `${typePrints[l.type].padEnd(15)} | ${l.pkg.padEnd(35)} | ${l.extra}`).join('\n  - ')}`
		);
	}
	process.exit(val);
}

async function getNpmAndGitHubData(pkg: string): Promise<PackageKey & PackageNpm & PackageGithub> {
	const [npmInfo, npmDlInfo] = await Promise.all([
		fetchJson(`https://registry.npmjs.org/${pkg}`),
		fetchJson(`https://api.npmjs.org/downloads/point/last-week/${pkg}`)
	]);

	if (npmInfo.error) {
		logsAtTheEnd.push({ type: 'npm_error', pkg, extra: npmInfo.error });
		theEnd(1);
	}

	// delete npmInfo.readme;
	// delete npmInfo.versions;
	// console.log(`npmInfo`, npmInfo);

	const npm_description = npmInfo.description;
	const raw_repo_url = npmInfo.repository?.url ?? '';
	let repo_url = raw_repo_url
		?.replace(/^git\+/, '')
		.replace(/\.git$/, '')
		.replace(/ssh:\/\/git@github.com\/(.+)/, (_, m) => `https://github.com/${m}`);

	if (!repo_url) {
		// console.error(`repo_url not found for ${pkg}`);
		logsAtTheEnd.push({ type: 'no_repo_url', pkg, extra: `not found` });
	}

	if (repo_url.startsWith('github.com')) {
		repo_url = 'https://' + repo_url;
	}

	const git_org = repo_url?.split('/')[3];
	const git_repo = repo_url?.split('/')[4];

	const authors = npmInfo.maintainers?.map((m: { name: string }) => m.name);
	const homepage = npmInfo.homepage;
	const downloads = npmDlInfo.downloads;
	const version = npmInfo['dist-tags'].latest;
	const updated = npmInfo.time[version];
	const pkgInfo = npmInfo.versions[version];
	const deprecated_reason = pkgInfo.deprecated;

	const svelte_range =
		pkgInfo.peerDependencies?.svelte ??
		pkgInfo.dependencies?.svelte ??
		pkgInfo.devDependencies?.svelte;

	const kit_range =
		pkgInfo.peerDependencies?.['@sveltejs/kit'] ??
		pkgInfo.dependencies?.['@sveltejs/kit'] ??
		pkgInfo.devDependencies?.['@sveltejs/kit'];

	// GitHub
	let github_stars: number | undefined = undefined;
	if (git_org && git_repo && !skipGithubStars) {
		const token = process.env.GITHUB_TOKEN;
		const headers = token ? new Headers({ authorization: 'Bearer ' + token }) : {};
		const res = await fetchJson(`https://api.github.com/repos/${git_org}/${git_repo}`, { headers });
		if (res?.message && res?.message.startsWith('API rate limit exceeded')) {
			skipGithubStars = true;
		} else {
			github_stars = res.stargazers_count;
		}
	}

	return {
		name: pkg,
		npm_description,
		repo_url,
		authors,
		homepage,
		version,
		deprecated_reason,
		downloads,
		updated,
		svelte_range,
		kit_range,

		// GitHub
		github_stars
	};
}

async function refreshJsonFile(fullPath: string) {
	console.log(`Refreshing:`, fullPath);

	const currentJson = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
	const newData = await getNpmAndGitHubData(currentJson.name);

	// remove all undefined values
	for (const key in newData) {
		if (newData[key] === undefined) {
			delete newData[key];
		}
	}

	// Let's not filter npm downloads changes
	// // filter changes of downloads
	// if (newData.downloads && currentJson.downloads) {
	// 	const dlDelta = Math.abs(
	// 		((newData.downloads - currentJson.downloads) / currentJson.downloads) * 100
	// 	);
	// 	if (dlDelta < 2.5) delete newData.downloads;
	// }

	const data = { ...currentJson, ...newData };

	// Some stats infos to log
	if (data.downloads && data.downloads < 255) {
		logsAtTheEnd.push({ type: 'low_downloads', pkg: data.name, extra: `${data.downloads}` });
	}

	if (data.github_stars && data.github_stars < 42) {
		logsAtTheEnd.push({
			type: 'low_github_stars',
			pkg: data.name,
			extra: `${data.github_stars}`
		});
	}

	if (data.updated && PACKAGES_META.is_outdated(data.updated)) {
		logsAtTheEnd.push({ type: 'outdated', pkg: data.name, extra: `${data.updated}` });
	}

	if (data.deprecated_reason) {
		logsAtTheEnd.push({ type: 'deprecated', pkg: data.name, extra: `${data.deprecated_reason}` });
	}

	writeJsonData(fullPath, data);
}

function writeJsonData(path: string, data: any) {
	const keysOrder: (keyof PackageKey | keyof PackageNpm | keyof PackageGithub)[] = [
		'name',
		'npm_description',
		'repo_url',
		'authors',
		'homepage',
		'version',
		'deprecated_reason',
		'downloads',
		'github_stars',
		'updated',
		'svelte_range',
		'kit_range',
		'typescript',
		'runes',
		'last_rune_check_version'
	];

	const sortedData: Record<string, any> = {};
	for (const key of keysOrder) {
		if (data[key] !== undefined) {
			sortedData[key] = data[key];
		}
	}
	// all all the remaining keys
	for (const key in data) {
		if (!keysOrder.includes(key as keyof PackageKey | keyof PackageNpm | keyof PackageGithub)) {
			sortedData[key] = data[key];
		}
	}

	fs.writeFileSync(path, JSON.stringify(sortedData, null, 2));
	execSync(`prettier --write ${path}`);
}

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
	const headers = new Headers({ ...options.headers, 'User-Agent': 'svelte.dev/packages_v0.0.1' });

	for (let i = 0; i < 5; i++) {
		try {
			const res = await fetch(url, { ...options, headers });
			return await res.json();
		} catch (e) {
			console.error(`Failed to fetch ${url} after ${i + 1} retries`);
		}

		await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i + 1)));
	}
}
