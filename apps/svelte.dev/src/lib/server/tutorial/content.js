import { posixify } from '$lib/utils/path.js';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import glob from 'tiny-glob';
import { transform } from './markdown.js';

const text_files = new Set([
	'.svelte',
	'.txt',
	'.json',
	'.js',
	'.ts',
	'.css',
	'.svg',
	'.html',
	'.md',
	'.env'
]);

const excluded = new Set(['.DS_Store', '.gitkeep', '.svelte-kit', 'package-lock.json']);

/** @param {string} file */
async function json(file) {
	return JSON.parse(await readFile(file, 'utf-8'));
}

/** @param {string} dir */
function is_valid(dir) {
	return /^\d{2}-/.test(dir);
}

/**
 * @param {string} path
 */
async function exists(path) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * @param {string} part
 * @param {string} chapter
 * @param {string} dir
 */
async function exists_readme(part, chapter, dir) {
	return exists(`content/tutorial/${part}/${chapter}/${dir}/README.md`);
}

/**
 * @returns {Promise<import('$lib/tutorial').PartStub[]>}
 */
export async function get_index() {
	return [
		{
			chapters: [
				{
					title: 'Introduction',
					slug: 'todo',
					exercises: [{ title: 'TODO', slug: 'welcome-to-svelte' }]
				}
			],
			slug: 'todo',
			title: 'TODO'
		}
	];

	const parts = (await readdir('content/tutorial')).filter(is_valid).map(posixify);

	/** @type {import('$lib/tutorial').PartStub[]} */
	const final_data = [];

	for (const part of parts) {
		const chapters = (await readdir(`content/tutorial/${part}`)).filter(is_valid).map(posixify);

		const obj = /** @type {import('$lib/tutorial').PartStub} */ ({
			slug: part,
			title: (await json(`content/tutorial/${part}/meta.json`)).title,
			chapters: []
		});

		for (const chapter of chapters) {
			let exercises = await readdir(`content/tutorial/${part}/${chapter}`);
			for (const exercise of exercises) {
				if (!(is_valid(exercise) && (await exists_readme(part, chapter, exercise)))) {
					exercises = exercises.filter((e) => e !== exercise);
				}
			}
			exercises = exercises.map(posixify);

			const chapters_obj = /** @type {import('$lib/tutorial').ChapterStub} */ ({
				slug: chapter,
				title: (await json(`content/tutorial/${part}/${chapter}/meta.json`)).title,
				exercises: []
			});

			for (const exercise of exercises) {
				const dir = `content/tutorial/${part}/${chapter}/${exercise}`;

				const text = await readFile(`${dir}/README.md`, 'utf-8');
				const { frontmatter } = extract_frontmatter(text, dir);
				const { title } = frontmatter;

				chapters_obj.exercises.push({
					slug: exercise.slice(3),
					title
				});
			}

			obj.chapters.push(chapters_obj);
		}

		final_data.push(obj);
	}

	return final_data;
}

/**
 * @param {string} slug
 * @returns {Promise<import('$lib/tutorial').Exercise | undefined>}
 */
export async function get_exercise(slug) {
	/** @type {import('$lib/tutorial').Exercise['a']} */
	const a = {
		'/package.json': {
			type: 'file',
			name: '/package.json',
			basename: 'package.json',
			text: true,
			contents:
				'{\r\n\t"name": "tutorial",\r\n\t"version": "0.0.1",\r\n\t"scripts": {\r\n\t\t"dev": "./node_modules/vite/bin/vite.js dev",\r\n\t\t"build": "./node_modules/vite/bin/vite.js build",\r\n\t\t"preview": "./node_modules/vite/bin/vite.js preview"\r\n\t},\r\n\t"devDependencies": {\r\n\t\t"@sveltejs/kit": "^1.20.4",\r\n\t\t"esbuild-wasm": "^0.18.9",\r\n\t\t"svelte": "^4.0.0",\r\n\t\t"vite": "^4.3.9"\r\n\t},\r\n\t"type": "module"\r\n}\r\n'
		},
		'/src': {
			type: 'directory',
			name: '/src',
			basename: 'src'
		},
		'/src/app.html': {
			type: 'file',
			name: '/src/app.html',
			basename: 'app.html',
			text: true,
			contents:
				"<!DOCTYPE html>\r\n<html lang=\"en\">\r\n\t<head>\r\n\t\t<meta charset=\"utf-8\" />\r\n\t\t<link rel=\"icon\" href=\"%sveltekit.assets%/favicon.png\" />\r\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\t\t<meta name=\"color-scheme\" content=\"dark light\" />\r\n\t\t%sveltekit.head%\r\n\r\n\t\t<style>\r\n\t\t\tbody {\r\n\t\t\t\t--bg-1: hsl(0, 0%, 100%);\r\n\t\t\t\t--bg-2: hsl(206, 20%, 90%);\r\n\t\t\t\t--bg-3: hsl(206, 20%, 80%);\r\n\t\t\t\t--fg-1: hsl(0, 0%, 13%);\r\n\t\t\t\t--fg-2: hsl(0, 0%, 20%);\r\n\t\t\t\t--fg-2: hsl(0, 0%, 30%);\r\n\t\t\t\t--link: hsl(208, 77%, 47%);\r\n\t\t\t\t--link-hover: hsl(208, 77%, 55%);\r\n\t\t\t\t--link-active: hsl(208, 77%, 40%);\r\n\t\t\t\t--border-radius: 4px;\r\n\t\t\t\t--font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,\r\n\t\t\t\t\t'Open Sans', 'Helvetica Neue', sans-serif;\r\n\t\t\t\t--font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas,\r\n\t\t\t\t\t'DejaVu Sans Mono', monospace;\r\n\t\t\t\tbackground: var(--bg-1);\r\n\t\t\t\tcolor: var(--fg-1);\r\n\t\t\t\tfont-family: var(--font);\r\n\t\t\t\tline-height: 1.5;\r\n\t\t\t\tmargin: 1rem;\r\n\t\t\t\theight: calc(100vh - 2rem);\r\n\t\t\t}\r\n\r\n\t\t\th1,\r\n\t\t\th2,\r\n\t\t\th3,\r\n\t\t\th4,\r\n\t\t\th5,\r\n\t\t\th6 {\r\n\t\t\t\tfont-weight: normal;\r\n\t\t\t\tfont-variant-numeric: tabular-nums;\r\n\t\t\t\tline-height: 1.1;\r\n\t\t\t}\r\n\r\n\t\t\t:is(h1, h2, h3, h4, h5, h6, p) {\r\n\t\t\t\tmargin: 1rem 0.1rem;\r\n\t\t\t}\r\n\r\n\t\t\tlabel {\r\n\t\t\t\tmargin: 0.5rem 0.1rem;\r\n\t\t\t}\r\n\r\n\t\t\t:is(h1, h2, h3, h4, h5, h6, p, label):first-child {\r\n\t\t\t\tmargin-top: 0;\r\n\t\t\t}\r\n\r\n\t\t\t:is(h1, h2, h3, h4, h5, h6, p, label):last-child {\r\n\t\t\t\tmargin-bottom: 0;\r\n\t\t\t}\r\n\r\n\t\t\ta {\r\n\t\t\t\tcolor: var(--link);\r\n\t\t\t}\r\n\r\n\t\t\ta:hover {\r\n\t\t\t\tcolor: var(--link-hover);\r\n\t\t\t}\r\n\r\n\t\t\ta:active {\r\n\t\t\t\tcolor: var(--link-active);\r\n\t\t\t}\r\n\r\n\t\t\tlabel {\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\tgap: 0.5rem;\r\n\t\t\t\talign-items: center;\r\n\t\t\t}\r\n\r\n\t\t\tlabel input {\r\n\t\t\t\tmargin: 0;\r\n\t\t\t}\r\n\r\n\t\t\tbutton,\r\n\t\t\tinput,\r\n\t\t\tselect {\r\n\t\t\t\tfont-family: inherit;\r\n\t\t\t\tfont-size: inherit;\r\n\t\t\t}\r\n\r\n\t\t\tbutton {\r\n\t\t\t\tbackground: var(--link);\r\n\t\t\t\tcolor: var(--bg-1);\r\n\t\t\t\tpadding: 0.5rem 1rem;\r\n\t\t\t\tborder: none;\r\n\t\t\t\tborder-radius: var(--border-radius);\r\n\t\t\t}\r\n\r\n\t\t\tbutton:hover {\r\n\t\t\t\tbackground: var(--link-hover);\r\n\t\t\t}\r\n\r\n\t\t\tbutton:active {\r\n\t\t\t\tbackground: var(--link-active);\r\n\t\t\t}\r\n\r\n\t\t\t:is(button, button:hover, button:active):disabled {\r\n\t\t\t\tbackground: var(--link);\r\n\t\t\t\tfilter: grayscale(1);\r\n\t\t\t\topacity: 0.4;\r\n\t\t\t}\r\n\r\n\t\t\tinput,\r\n\t\t\ttextarea,\r\n\t\t\tselect {\r\n\t\t\t\tpadding: 0.5rem;\r\n\t\t\t\tborder: 1px solid var(--bg-2);\r\n\t\t\t\tborder-radius: var(--border-radius);\r\n\t\t\t\tbox-sizing: border-box;\r\n\t\t\t}\r\n\r\n\t\t\tinput,\r\n\t\t\ttextarea {\r\n\t\t\t\tbackground: var(--bg-1);\r\n\t\t\t\tcolor: inherit;\r\n\t\t\t}\r\n\r\n\t\t\tselect:not([multiple]) {\r\n\t\t\t\tbackground: var(--bg-2);\r\n\t\t\t}\r\n\r\n\t\t\ttextarea {\r\n\t\t\t\tfont-family: var(--font-mono);\r\n\t\t\t\tfont-size: 0.9rem;\r\n\t\t\t}\r\n\r\n\t\t\tform {\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\tflex-direction: column;\r\n\t\t\t\tgap: 1rem;\r\n\t\t\t\talign-items: baseline;\r\n\t\t\t}\r\n\r\n\t\t\tul:has(li):has(form) {\r\n\t\t\t\tlist-style: none;\r\n\t\t\t\tpadding: 0;\r\n\t\t\t}\r\n\r\n\t\t\tli form {\r\n\t\t\t\tflex-direction: row;\r\n\t\t\t\tgap: 0.5rem;\r\n\t\t\t\tmargin: 0.5rem 0;\r\n\t\t\t}\r\n\r\n\t\t\tnav {\r\n\t\t\t\tposition: relative;\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\tgap: 1em;\r\n\t\t\t\tpadding: 1em;\r\n\t\t\t\tbackground: var(--bg-2);\r\n\t\t\t\tz-index: 2;\r\n\t\t\t\tmargin: 0 0 1em 0;\r\n\t\t\t\tborder-radius: var(--border-radius);\r\n\t\t\t}\r\n\r\n\t\t\tnav a {\r\n\t\t\t\ttext-decoration: none;\r\n\t\t\t}\r\n\r\n\t\t\tnav a[aria-current='true'] {\r\n\t\t\t\tborder-bottom: 2px solid;\r\n\t\t\t}\r\n\r\n\t\t\tul:has(form) {\r\n\t\t\t\tlist-style: none;\r\n\t\t\t\tpadding: 0;\r\n\t\t\t}\r\n\r\n\t\t\tprogress {\r\n\t\t\t\tmargin: 0.5rem 0;\r\n\t\t\t}\r\n\r\n\t\t\tprogress:first-child {\r\n\t\t\t\tmargin-top: 0;\r\n\t\t\t}\r\n\r\n\t\t\tprogress:last-child {\r\n\t\t\t\tmargin-bottom: 0;\r\n\t\t\t}\r\n\r\n\t\t\t.error {\r\n\t\t\t\tcolor: red;\r\n\t\t\t}\r\n\r\n\t\t\tcode {\r\n\t\t\t\tbackground: var(--bg-2);\r\n\t\t\t\tfont-family: var(--font-mono);\r\n\t\t\t\tfont-size: 0.9em;\r\n\t\t\t\tpadding: 0.15rem 0.3rem;\r\n\t\t\t\tborder-radius: var(--border-radius);\r\n\t\t\t}\r\n\r\n\t\t\tul.todos {\r\n\t\t\t\tpadding: 0;\r\n\t\t\t}\r\n\r\n\t\t\tul.todos li:not(:has(> form)),\r\n\t\t\tul.todos li form {\r\n\t\t\t\tposition: relative;\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\talign-items: center;\r\n\t\t\t\tpadding: 0.5em 0.5em 0.5em 1em;\r\n\t\t\t\tmargin: 0 0 0.5em 0;\r\n\t\t\t\tgap: 0.5em;\r\n\t\t\t\tborder-radius: 5px;\r\n\t\t\t\tuser-select: none;\r\n\t\t\t\tbackground: var(--bg-1);\r\n\t\t\t\tfilter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.1));\r\n\t\t\t\ttransition: filter 0.2s, opacity 0.2s;\r\n\t\t\t}\r\n\r\n\t\t\tul.todos .done {\r\n\t\t\t\tfilter: none;\r\n\t\t\t\topacity: 0.4;\r\n\t\t\t}\r\n\r\n\t\t\tul.todos button {\r\n\t\t\t\tborder: none;\r\n\t\t\t\tbackground-color: transparent;\r\n\t\t\t\tbackground-repeat: no-repeat;\r\n\t\t\t\tbackground-position: 50% 50%;\r\n\t\t\t\tbackground-size: 1rem 1rem;\r\n\t\t\t\tcursor: pointer;\r\n\t\t\t\twidth: 3em;\r\n\t\t\t\theight: 3em;\r\n\t\t\t\tmargin: -0.5em -0.5em -0.5em 0;\r\n\t\t\t\taspect-ratio: 1;\r\n\t\t\t\topacity: 0.5;\r\n\t\t\t\ttransition: opacity 0.2s;\r\n\t\t\t}\r\n\r\n\t\t\tul.todos button:hover {\r\n\t\t\t\topacity: 1;\r\n\t\t\t}\r\n\r\n\t\t\tbody.dark {\r\n\t\t\t\t--bg-1: hsl(0, 0%, 18%);\r\n\t\t\t\t--bg-2: hsl(0, 0%, 30%);\r\n\t\t\t\t--bg-3: hsl(0, 0%, 40%);\r\n\t\t\t\t--fg-1: hsl(0, 0%, 90%);\r\n\t\t\t\t--fg-2: hsl(0, 0%, 70%);\r\n\t\t\t\t--fg-3: hsl(0, 0%, 60%);\r\n\t\t\t\t--link: hsl(206, 96%, 72%);\r\n\t\t\t\t--link-hover: hsl(206, 96%, 78%);\r\n\t\t\t\t--link-active: hsl(206, 96%, 64%);\r\n\t\t\t}\r\n\t\t</style>\r\n\t</head>\r\n\t<body>\r\n\t\t<div style=\"display: contents\">%sveltekit.body%</div>\r\n\r\n\t\t<script>\r\n\t\t\tconst theme = new URL(window.location).searchParams.get('theme');\r\n\r\n\t\t\tdocument.body.classList.remove('light', 'dark');\r\n\t\t\tdocument.body.classList.add(theme || 'light');\r\n\t\t</script>\r\n\t</body>\r\n</html>\r\n"
		},
		'/src/routes': {
			type: 'directory',
			name: '/src/routes',
			basename: 'routes'
		},
		'/src/routes/+page.svelte': {
			type: 'file',
			name: '/src/routes/+page.svelte',
			basename: '+page.svelte',
			text: true,
			contents: "<script>\r\n\timport App from '$lib/App.svelte';\r\n</script>\r\n\r\n<App />\r\n"
		},
		'/src/__client.js': {
			type: 'file',
			name: '/src/__client.js',
			basename: '__client.js',
			text: true,
			contents:
				"function post(data) {\r\n\tparent.postMessage(data, '*');\r\n}\r\n\r\nfunction update_path(path) {\r\n\tpost({ type: 'path', path });\r\n}\r\n\r\nfunction ping() {\r\n\tpost({ type: 'ping' });\r\n}\r\n\r\nfunction pause() {\r\n\tpost({ type: 'ping-pause' });\r\n}\r\n\r\n// Hack into the alert that's used in some tutorials and send a message prior to the alert,\r\n// else the parent thinks we lost contact and wrongfully reloads the page.\r\n// The drawback is that alert is no longer blocking, but no tutorial relies on this.\r\nconst alert = window.alert;\r\nwindow.alert = (message) => {\r\n\tpause();\r\n\r\n\tsetTimeout(() => {\r\n\t\talert(message);\r\n\t});\r\n};\r\n\r\nlet can_focus = false;\r\n\r\nwindow.addEventListener('pointerdown', (e) => can_focus = true);\r\nwindow.addEventListener('pointerup', (e) => can_focus = false);\r\nwindow.addEventListener('keydown', (e) => can_focus = true);\r\nwindow.addEventListener('keyup', (e) => can_focus = false);\r\n\r\n/**\r\n * The iframe sometimes takes focus control in ways we can't prevent\r\n * while the editor is focused. Refocus the editor in these cases.\r\n */\r\nwindow.addEventListener('focusin', (e) => {\r\n\t// if focusin happened as a result of a mouse/keyboard event, allow it\r\n\tif (can_focus) return;\r\n\r\n\t// if `e.target` is the `<body>` and there's a `relatedTarget`,\r\n\t// assume the focusin was the result of a user navigation — allow it\r\n\tif (e.target.tagName === 'BODY' && e.relatedTarget) return;\r\n\r\n\t// otherwise, broadcast an event that causes the editor to reclaim focus\r\n\tpost({ type: 'iframe_took_focus' });\r\n});\r\n\r\nlet previous_href = location.href;\r\n\r\nwindow.addEventListener('click', (e) => {\r\n\tlet node = e.target;\r\n\twhile (node) {\r\n\t\tif (node.nodeName === 'A') {\r\n\t\t\tconst href = node.href;\r\n\t\t\tconst url = new URL(href);\r\n\r\n\t\t\tif (url.origin !== location.origin) {\r\n\t\t\t\te.preventDefault();\r\n\t\t\t\twindow.open(url, '_blank');\r\n\t\t\t} else {\r\n\t\t\t\tif (location.href !== url.href) {\r\n\t\t\t\t\tprevious_href = url.href;\r\n\t\t\t\t\tupdate_path(url.pathname + url.search + url.hash);\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t}\r\n\t\tnode = node.parent;\r\n\t}\r\n});\r\n\r\nwindow.addEventListener('visibilitychange', () => {\r\n\tif (document.visibilityState === 'visible') {\r\n\t\tping();\r\n\t} else {\r\n\t\tpause();\r\n\t}\r\n});\r\n\r\nconst url_observer = new MutationObserver(() => {\r\n\tif (location.href !== previous_href) {\r\n\t\tprevious_href = location.href;\r\n\t\tupdate_path(location.pathname + location.search + location.hash);\r\n\t}\r\n});\r\n\r\nurl_observer.observe(document, {\r\n\tsubtree: true,\r\n\tchildList: true,\r\n\tattributes: true\r\n});\r\n\r\nsetInterval(ping, 100);\r\nping();\r\n\r\nif (import.meta.hot) {\r\n\timport.meta.hot.on('vite:beforeUpdate', (event) => {\r\n\t\tpost({ type: 'hmr', data: event.updates });\r\n\t});\r\n}\r\n"
		},
		'/static': {
			type: 'directory',
			name: '/static',
			basename: 'static'
		},
		'/static/favicon.png': {
			type: 'file',
			name: '/static/favicon.png',
			basename: 'favicon.png',
			text: false,
			contents:
				'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAY1BMVEX/////PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/PgD/ShD/e1D/q5D/z8D/////6OD/w7D/n4D/YjD/bkD/t6D/9PD/29D/ViD/k3D/h2CABuufAAAAEXRSTlMAEEAgYKDA/9BwMJDg8FCAsCvw0kAAAASYSURBVHgB7ZvnYqs4EIXpgzGYCCM6Nu//ktt3s+NyogPBW66/f7ckDCN9YkYC782b/w1+8Du+93rCKE7kkzQ+ZK+8+jGXe4r45L2EKJFn5GW4/+VzgcT7hpAl8iXH/eakfxQXir3mQpCLIx97JMH/EHfS75fyVAhg92EIE2GJvG/kUAhm3wiyVDD7RuCXspIi29c9U51r+xtN2/UPI9huox/LE4bRKprOyB3Jbu71tb1jehDCYSf3OvuQqZIbinAP94bGPmPkB4F2z5wtYDaiCb7bvWqylokg+V73Lq39ippOAeHedbJfc+ZTwLsHGUQRsrfv5h6g2bIW+Kmre4BOFyeUfIWze4Bp9RhkBXCPYFn5WM4K2r22Mv1S3/2tbhXI8Sfcm/snGTKrREwe3v5z96br5xSFJnpulKR79UU+GZEHvtsEeOTebD+Bj94LWg0D1wEg3BuNaCadHT6A0717jX1GM8gt89YAcrkB3P6j8s9uDCCSG0bo3j1mafkAwAwYoXuPMddGWcAEEOL8a/cAyx8hLGwAR1EMTu6BdfPCLkSpzmXj4h6o2hpR0CPQQfcckjDqoox2YHJxD9BrT47sFFigezwnVsIWusfjs8sgdI/nw/saPYKut38Zul9Zhu0bJXAKDE/2B/7m6nxVOaJ3KTIk4YhWvE9qHSdXEQYogMGlTgEzJdwaAFGnXGECAD4TAKhTbGvQDACgACp9+y2xO+DeGOpbBJMQ9+c6AqYpSUGBawfYI4CmiCjJ9U58YxXTQPXn1zVjUOJybOxFjFYfoG3MPRcCXA9x1KLIPBcEjQHL4FYNgEmw2E20KzZIItTmIOq6xrPA0QO/YGaB3p42HRYh8FyIcVmKe4R+QmNQrmrOa4vRPUKFNqniVdsjZrYY3SPMYBIk3GoMIgA9whWI6BbAQW4xI9GfDyCAnLBAs0zO/XmFliLiYYCTAIrk89YACnnMZZwcDsfETBuHIJLnVOP8V+7PlTyk3bpP+SGYfviFXp5wmeF+fcIWpSwdfhrJkRkBAtAjLOxSHAsP6BEmwz6Mcp3SXhwAPcJIl6WimGwngsE9woUtSIK77rzGScA9QieKkt0mvrrsCIEeYRZNxq7DrTqMp8/wpl7okrB8XA9OYw/cc7y+RHQAakk798A9l+sXPh+AokbuOTyoS29jAB12T3MmtgeIDLBneHoG8AHUYFlFZ3idoLdoiIWofT4G3YR7hLWvsGSowLV/JbYHZ3gLv0nMbpSaM7M3Rb44kOLmvDlXyzi59QigIwIcib4QuEdcHz6NLhaD3QOFGKDAR2aEe2gBAMSwyndxT5NnHkcAGi3CvQ2vNuf43JRwTyQNPJ4InYVj94jnH5ECM69zTxK4+hIpMPUa9wq4+BGrIZax2+WV8gy/vOXi3snbROlyNGUb0j1+EDRLq9WrhHWPICzkAWbo2vpX2m4QYdzjyYSHdw+7iMHuvT4C3j0+gtd/0BIUAuDd4wlTcSYPXv8xEXbvpd8TJZm3H2Uhgikib1d8HEJR+v/kV3155HsvITw8iCE9Zt4rCQ5xksvvJB/l6Vvu/c2bNz8Dvqu7Y0Ckv5MAAAAASUVORK5CYII='
		},
		'/svelte.config.js': {
			type: 'file',
			name: '/svelte.config.js',
			basename: 'svelte.config.js',
			text: true,
			contents:
				"/** @type {import('@sveltejs/kit').Config} */\r\nconst config = {\r\n\tkit: {\r\n\t\t// For the tutorial, we need to disable CSRF protection.\r\n\t\t// Don't do this in your own apps unless you know what you're doing!\r\n\t\t// See https://kit.svelte.dev/docs/configuration#csrf for more info.\r\n\t\tcsrf: false\r\n\t},\r\n\r\n\tvitePlugin: {\r\n\t\t// This enables compile-time warnings to be\r\n\t\t// visible in the learn.svelte.dev editor\r\n\t\tonwarn: (warning, defaultHandler) => {\r\n\t\t\tconsole.log('svelte:warnings:%s', JSON.stringify(warning));\r\n\t\t\tdefaultHandler(warning);\r\n\t\t}\r\n\t}\r\n};\r\n\r\nexport default config;\r\n"
		},
		'/vite.config.js': {
			type: 'file',
			name: '/vite.config.js',
			basename: 'vite.config.js',
			text: true,
			contents:
				"import { sveltekit } from '@sveltejs/kit/vite';\r\nimport { defineConfig } from 'vite';\r\n\r\nexport default defineConfig({\r\n\tplugins: [sveltekit()],\r\n\r\n\t// Normally this would be unnecessary, but we\r\n\t// need it for learn.svelte.dev\r\n\tserver: {\r\n\t\tfs: {\r\n\t\t\tstrict: false\r\n\t\t}\r\n\t}\r\n});\r\n"
		},
		'/src/routes/+error.svelte': {
			type: 'file',
			name: '/src/routes/+error.svelte',
			basename: '+error.svelte',
			text: true,
			contents:
				'<script>\r\n\timport { page } from \'$app/stores\';\r\n</script>\r\n\r\n{#if $page.status === 404}\r\n\t<h1>Not found</h1>\r\n\t<p><a href="/">Go to /</a></p>\r\n{:else}\r\n\t<p>\r\n\t\tServer-side rendering failed with HTTP status\r\n\t\tcode\r\n\t\t<a\r\n\t\t\ttarget="_blank"\r\n\t\t\thref="https://http.dog/{$page.status}"\r\n\t\t\t>{$page.status}</a\r\n\t\t>\r\n\t</p>\r\n{/if}\r\n\r\n<style>\r\n\th1 {\r\n\t\tfont-weight: 200;\r\n\t\tfont-size: 2rem;\r\n\t\tmargin: 0 0 0.5em 0;\r\n\t}\r\n</style>\r\n'
		},
		'/src/routes/+layout.js': {
			type: 'file',
			name: '/src/routes/+layout.js',
			basename: '+layout.js',
			text: true,
			contents: 'export const ssr = false;\r\n'
		},
		'/src/lib': {
			type: 'directory',
			name: '/src/lib',
			basename: 'lib'
		},
		'/src/lib/App.svelte': {
			type: 'file',
			name: '/src/lib/App.svelte',
			basename: 'App.svelte',
			text: true,
			contents: '<h1>Welcome!</h1>\r\n'
		}
	};
	return {
		path: '/',
		a,
		b: {
			...a
		},
		scope: { prefix: '/src/lib', name: 'src' },
		chapter: { title: 'TODO', slug: 'welcome-to-svelte' },
		dir: 'content/tutorial/01-svelte/01-introduction/01-welcome-to-svelte',
		editing_constraints: { create: new Set(), remove: new Set() },
		focus: '/src/lib/App.svelte',
		has_solution: false,
		html: 'TODO',
		markdown: 'TODO',
		next: null,
		part: { label: 'TODO', slug: 'todo', title: 'TODO' },
		prev: null,
		slug: 'welcome-to-svelte',
		title: 'TODO'
	};

	const exercises = (
		await glob('[0-9][0-9]-*/[0-9][0-9]-*/[0-9][0-9]-*/README.md', {
			cwd: 'content/tutorial'
		})
	).map(posixify);

	/** @type {string[]} */
	const chain = [];

	for (let i = 0; i < exercises.length; i += 1) {
		const file = exercises[i];
		const [part_dir, chapter_dir, exercise_dir] = file.split('/');
		const exercise_slug = exercise_dir.slice(3);

		const dir = `content/tutorial/${part_dir}/${chapter_dir}/${exercise_dir}`;

		if (await exists(`${dir}/app-a`)) {
			chain.length = 0;
			chain.push(`${dir}/app-a`);
		}

		if (exercise_slug === slug) {
			const a = {
				...(await walk('content/tutorial/common', {
					exclude: ['node_modules', 'static/tutorial', 'static/svelte-logo-mask.svg']
				})),
				...(await walk(`content/tutorial/${part_dir}/common`))
			};

			for (const dir of chain) {
				Object.assign(a, await walk(dir));
			}

			const b = await walk(`${dir}/app-b`);
			const has_solution = Object.keys(b).length > 0;

			// ensure no duplicate content
			for (const key in b) {
				if (!a[key]) continue;
				if (b[key].type !== 'file') continue;

				const a_ = /** @type {import('$lib/tutorial').FileStub} */ (a[key]);
				const b_ = /** @type {import('$lib/tutorial').FileStub} */ (b[key]);

				if (a_.contents === b_.contents) {
					throw new Error(`duplicate file: ${exercise_slug} ${key}`);
				}
			}

			const part_meta = await json(`content/tutorial/${part_dir}/meta.json`);
			const chapter_meta = await json(`content/tutorial/${part_dir}/${chapter_dir}/meta.json`);

			const exercise_meta_file = `content/tutorial/${part_dir}/${chapter_dir}/${exercise_dir}/meta.json`;
			const exercise_meta = (await exists(exercise_meta_file))
				? await json(exercise_meta_file)
				: {};

			const scope = chapter_meta.scope ?? part_meta.scope;

			const text = await readFile(`${dir}/README.md`, 'utf-8');
			const { frontmatter, markdown } = extract_frontmatter(text, dir);
			const { title, path = '/', focus } = frontmatter;

			const prev_slug = exercises[i - 1]?.split('/')[2].slice(3);
			const prev = prev_slug
				? {
						slug: prev_slug
					}
				: null;

			let next = null;

			const next_exercise = exercises[i + 1];

			if (next_exercise) {
				/** @type {string} */
				let title;

				const dirs = next_exercise.split('/');
				if (dirs[0] !== part_dir) {
					title = (await json(`content/tutorial/${dirs[0]}/meta.json`)).title;
				} else if (dirs[1] !== chapter_dir) {
					title = (await json(`content/tutorial/${dirs[0]}/${dirs[1]}/meta.json`)).title;
				} else {
					title = extract_frontmatter(
						await readFile(`content/tutorial/${next_exercise}`, 'utf-8'),
						next_exercise
					).frontmatter.title;
				}

				next = {
					slug: next_exercise.split('/')[2].slice(3),
					title
				};
			}

			const editing_constraints = {
				create: new Set(exercise_meta.editing_constraints?.create ?? []),
				remove: new Set(exercise_meta.editing_constraints?.remove ?? [])
			};

			const solution = { ...a };

			for (const stub of Object.values(b)) {
				if (stub.type === 'file' && stub.contents.startsWith('__delete')) {
					// remove file
					editing_constraints.remove.add(stub.name);
					delete solution[stub.name];
				} else if (stub.name.endsWith('/__delete')) {
					// remove directory
					const parent = stub.name.slice(0, stub.name.lastIndexOf('/'));
					editing_constraints.remove.add(parent);
					delete solution[parent];
					for (const k in solution) {
						if (k.startsWith(parent + '/')) {
							delete solution[k];
						}
					}
				} else {
					if (!solution[stub.name]) {
						editing_constraints.create.add(stub.name);
					}
					solution[stub.name] = stub;
				}
			}

			// ensure every code block for an exercise with multiple files has a `/// file:` annotation
			const filtered = Object.values(solution).filter((item) => {
				return item.type === 'file' && item.name.startsWith(scope.prefix);
			});

			if (filtered.length > 0) {
				for (const match of markdown.matchAll(/```[a-z]+\n([\s\S]+?)\n```/g)) {
					const content = match[1];
					if (!content.includes('/// file') && !content.includes('/// no-file')) {
						throw new Error(`Code block lacks a \`/// file: ...\` annotation: ${dir}/README.md`);
					}
				}
			}

			const all_files = { ...a, ...solution };
			const filenames = new Set(
				Object.keys(all_files)
					.filter(
						(filename) => filename.startsWith(scope.prefix) && all_files[filename].type === 'file'
					)
					.map((filename) => filename.slice(scope.prefix.length))
			);

			return {
				part: {
					slug: part_dir,
					title: `Part ${part_dir.slice(1, 2)}`,
					label: part_meta.title
				},
				chapter: {
					slug: chapter_dir,
					title: chapter_meta.title
				},
				scope,
				focus: focus ?? chapter_meta.focus ?? part_meta.focus,
				title,
				path,
				slug: exercise_slug,
				prev,
				next,
				dir,
				editing_constraints,
				markdown,
				html: await transform(markdown, {
					codespan: (text) =>
						filenames.size > 1 && filenames.has(text)
							? `<code data-file="${scope.prefix + text}">${text}</code>`
							: `<code>${text}</code>`
				}),
				a,
				b: solution,
				has_solution
			};
		}

		chain.push(`${dir}/app-b`);
	}
}

/**
 * @param {string} markdown
 * @param {string} dir
 */
function extract_frontmatter(markdown, dir) {
	const match = /---\n([^]+?)\n---\n([^]+)/.exec(markdown);
	if (!match) {
		throw new Error(`bad markdown for ${dir}`);
	}

	/** @type {Record<string, string>} */
	const frontmatter = {};

	for (const line of match[1].split('\n')) {
		const index = line.indexOf(':');
		if (index !== -1) {
			frontmatter[line.slice(0, index).trim()] = line.slice(index + 1).trim();
		}
	}

	return { frontmatter, markdown: match[2] };
}

/**
 * Get a list of all files in a directory
 * @param {string} cwd - the directory to walk
 * @param {{
 *   exclude?: string[]
 * }} options
 */
async function walk(cwd, options = {}) {
	/** @type {Record<string, import('$lib/tutorial').FileStub | import('$lib/tutorial').DirectoryStub>} */
	const result = {};

	if (!(await exists(cwd))) return result;

	/**
	 * @param {string} dir
	 * @param {number} depth
	 */
	async function walk_dir(dir, depth) {
		const files = (await readdir(path.join(cwd, dir))).map(posixify);

		for (const basename of files) {
			if (excluded.has(basename)) continue;

			const name = dir + basename;

			if (options.exclude?.some((exclude) => posixify(name).endsWith(exclude))) continue;

			const resolved = path.join(cwd, name);
			const stats = await stat(resolved);

			if (stats.isDirectory()) {
				result[name] = {
					type: 'directory',
					name,
					basename
				};

				await walk_dir(name + '/', depth + 1);
			} else {
				const text = text_files.has(path.extname(name) || path.basename(name));
				const contents = await readFile(resolved, text ? 'utf-8' : 'base64');

				result[name] = {
					type: 'file',
					name,
					basename,
					text,
					contents
				};
			}
		}
	}

	return await walk_dir('/', 1), result;
}
