import { PACKAGES_META } from '../../src/lib/packages-meta';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const start = performance.now();
console.log('[sync-packages] start');

const packages = [
	...PACKAGES_META.FEATURED.flatMap((pkg) => pkg.packages),
	...PACKAGES_META.SV_ADD.packages
];

const registryFolder = 'src/lib/server/generated/registry';

// PART 1: create missing json files
for (const pkg of packages) {
	const cleanPkg = pkg.replace('@', '').replace('/', '-');
	const jsonPath = path.join(registryFolder, `${cleanPkg}.json`);
	if (!fs.existsSync(jsonPath)) {
		console.warn(`  "${pkg}" -> "${jsonPath}" not found, we will create it!`);
		const p = await fetchData(pkg);
		writeButPretty(jsonPath, JSON.stringify(p, null, 2));
	}
}

// PART 2: check if all json files are needed
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
	console.error(jsonNotNeeded.join('\n'));
	console.error(
		`ERROR: ${jsonNotNeeded.length} json files are not needed as they are not in the packages array`
	);

	// delete json files
	// for (const pkg of jsonNotNeeded) {
	// 	fs.unlinkSync(path.join(registryFolder, pkg));
	// }

	theEnd(1);
}

// PART 3: refresh data
registryJsonFiles = fs.readdirSync(registryFolder); // .slice(0, 1);

const batch = 10;
for (let i = 0; i < registryJsonFiles.length; i += batch) {
	const batchFiles = registryJsonFiles.slice(i, i + batch);
	await Promise.all(
		batchFiles.map(async (pkg) => {
			await refreshJson(path.join(registryFolder, pkg));
		})
	);
}

theEnd(0);

// HELPERS

function theEnd(val: number) {
	console.log(`[sync-packages] exit(${val}) - took: ${(performance.now() - start).toFixed(0)}ms`);
	process.exit(val);
}

async function fetchData(pkg: string) {
	const [npmInfo, npmDlInfo] = await Promise.all([
		fetch(`https://registry.npmjs.org/${pkg}`).then((r) => r.json()),
		fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`).then((r) => r.json())
	]);
	// delete npmInfo.readme;
	// delete npmInfo.versions;
	const description = npmInfo.description;
	const raw_repo_url = npmInfo.repository?.url ?? '';
	const repo_url = raw_repo_url?.replace(/^git\+/, '').replace(/\.git$/, '');
	if (!repo_url) {
		console.error(`repo_url not found for ${pkg}`);
	}
	const git_org = repo_url?.split('/')[3];
	const git_repo = repo_url?.split('/')[4];

	const authors = npmInfo.maintainers?.map((m: { name: string }) => m.name);
	const homepage = npmInfo.homepage;
	const downloads = npmDlInfo.downloads;
	const version = npmInfo['dist-tags'].latest;
	const updated = npmInfo.time[version];

	let github_stars = 0;
	if (git_org && git_repo) {
		const githubInfo = await fetch(`https://api.github.com/repos/${git_org}/${git_repo}`).then(
			(r) => r.json()
		);
		github_stars = githubInfo.stargazers_count;
	}

	return {
		name: pkg,
		// description, // let's not overwrite the description for now.
		repo_url,
		authors,
		homepage,
		downloads,
		version,
		updated,
		// runes: false,
		github_stars
		// typescript: false,
		// kit_range: '',
		// last_rune_check_version: ''
	};
}

async function refreshJson(fullPath: string) {
	console.log(`Working on:`, fullPath);

	const currentJson = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
	const newData = await fetchData(currentJson.name);

	// remove all undefined values
	for (const key in newData) {
		if (newData[key] === undefined) {
			delete newData[key];
		}
	}

	writeButPretty(fullPath, JSON.stringify({ ...currentJson, ...newData }, null, 2));
}

function writeButPretty(path: string, data: any) {
	fs.writeFileSync(path, data);
	execSync(`prettier --write ${path}`);
}
