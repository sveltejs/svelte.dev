import { describe, expect, test } from 'vitest';
import { find_references, link_references, type DocumentationReferences } from './references.ts';

const references = {
	'@sveltejs/kit': {
		AfterNavigate: '/docs/kit/@sveltejs-kit#AfterNavigate',
		Load: '/docs/kit/@sveltejs-kit#Load',
		redirect: '/docs/kit/@sveltejs-kit#redirect'
	},
	svelte: { onMount: '/docs/svelte/svelte#onMount', Load: '/docs/svelte/svelte#Load' },
	'./$types': '/docs/kit/types#Generated-types',
	'$app/forms': { enhance: '/docs/kit/$app-forms#enhance' },
	'svelte/transition': { fade: '/docs/svelte/svelte-transition#fade' },
	'svelte/animate': { flip: '/docs/svelte/svelte-animate#flip' }
} satisfies DocumentationReferences;

const kit = references['@sveltejs/kit'];
const types = references['./$types'];
const link = (text: string, href: string) => `${text} → ${href}`;
const redirect = link('redirect', kit.redirect);
const kit_load = link('Load', kit.Load);
const svelte_load = link('Load', references.svelte.Load);
const enhance = link('enhance', references['$app/forms'].enhance);
const appear = link('appear', references['svelte/transition'].fade);
const flip = link('flip', references['svelte/animate'].flip);

interface Options {
	language?: string;
	module?: string;
	prelude?: string;
}

const import_types = `/** @type {import('./$types').PageLoad} */
export const load = () => ({});
/** @satisfies {import('./$types').FutureRouteType} */
export const actions = {};
let navigation: import('@sveltejs/kit').AfterNavigate;
/** @type {import('@sveltejs/kit').Load.Nested.Member} */
let nested;`;

const import_types_expected = [
	link('PageLoad', types),
	link('FutureRouteType', types),
	link('AfterNavigate', kit.AfterNavigate),
	kit_load
];

test.each<[string, string, string[], Options?]>([
	[
		'links imported functions and their usages, not strings, comments or locals',
		`import { redirect } from '@sveltejs/kit';
redirect(303, '/');
const text = 'redirect';
// redirect
function local(redirect: () => void) { redirect(); }
const unrelated = { redirect: 1 };
unrelated.redirect;`,
		[redirect, redirect]
	],
	[
		'resolves aliases to the exported name and separates module collisions',
		`import { redirect as go, type Load } from '@sveltejs/kit';
import { Load as OtherLoad } from 'svelte';
go(303, '/');
let load: Load;
let other: OtherLoad;`,
		[
			redirect,
			link('go', kit.redirect),
			kit_load,
			svelte_load,
			link('OtherLoad', references.svelte.Load),
			link('go', kit.redirect),
			kit_load,
			link('OtherLoad', references.svelte.Load)
		]
	],
	[
		'links namespace members without linking the namespace or nested properties',
		`import * as Kit from '@sveltejs/kit';
Kit.redirect(303, '/');
let type: Kit.AfterNavigate;
Kit.redirect.name;
function local(Kit: any) { Kit.redirect(); }`,
		[redirect, link('AfterNavigate', kit.AfterNavigate), redirect]
	],
	['resolves import types and JSDoc in ts', import_types, import_types_expected],
	[
		'resolves import types and JSDoc in js',
		import_types,
		import_types_expected,
		{ language: 'js' }
	],
	[
		'links new generated exports, aliases and namespace members without linking shadowed locals',
		`import type { FutureRouteType as Data } from './$types';
import * as Route from './$types';
let data: Data;
let event: Route.FutureRouteEvent;
function local<Data>(value: Data): Data { return value; }`,
		['FutureRouteType', 'Data', 'Data', 'FutureRouteEvent'].map((text) => link(text, types))
	],
	[
		'uses the current module only for unbound declaration type references',
		`function afterNavigate(callback: (navigation: import('@sveltejs/kit').AfterNavigate) => void): void;
function fn(value: Load): Load;
function shadow<Load>(value: Load): Load;
interface Local {}
function local(value: Local): void;`,
		[link('AfterNavigate', kit.AfterNavigate), kit_load, kit_load],
		{ language: 'dts', module: '@sveltejs/kit' }
	],
	[
		'does not guess destinations for undocumented imports or arbitrary local types',
		`import { redirect } from 'other';
import type { PageLoad } from './local';
redirect();
let load: PageLoad;
let value: Load;`,
		[]
	],
	[
		'keeps type-parameter and block-local shadowing separate from imports',
		`import { redirect, type Load } from '@sveltejs/kit';
function fn<Load>(value: Load) {}
{ const redirect = () => {}; redirect(); }
redirect(303, '/');
let value: Load;`,
		[redirect, kit_load, redirect, kit_load]
	],
	[
		'uses hidden imports without linking hidden source',
		`redirect(303, '/');`,
		[redirect],
		{ prelude: `import { redirect } from '@sveltejs/kit';\n// ---cut---\n` }
	],
	[
		'links imported shorthand values, not destructured or property bindings',
		`import { redirect } from '@sveltejs/kit';
const value = { redirect };
function fn({ redirect }: any) { return { redirect }; }
const other = { redirect() {} };`,
		[redirect, redirect]
	],
	[
		'uses only the final hidden virtual file for import bindings',
		'redirect();',
		[],
		{
			prelude: `// @filename: helper.ts\nimport { redirect } from '@sveltejs/kit';\n// @filename: index.ts\n`
		}
	],
	[
		'links Svelte expressions and attributes, not text, comments or styles',
		`<script>import { redirect } from '@sveltejs/kit';</script>
<button onclick={() => redirect(303, '/')}>{redirect.name}</button>
<p>redirect</p><!-- <script>import { redirect } from '@sveltejs/kit';</script> -->
<style>redirect { color: red; }</style>`,
		[redirect, redirect, redirect],
		{ language: 'svelte' }
	],
	[
		'links Svelte action, transition and animation directive names',
		`<script>
import { enhance } from '$app/forms';
import { fade as appear } from 'svelte/transition';
import { flip } from 'svelte/animate';
</script>
<form method="POST" use:enhance={() => {}}></form>
<p in:appear|global={{ duration: 100 }} out:appear>hi</p>
{#each items as item (item)}<li animate:flip>{item}</li>{/each}
<div use:local transition:local></div>`,
		[
			enhance,
			link('fade', references['svelte/transition'].fade),
			appear,
			flip,
			enhance,
			appear,
			appear,
			flip
		],
		{ language: 'svelte' }
	],
	[
		'links directives in examples with unclosed markup',
		`<script>
	import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>`,
		[enhance, enhance],
		{ language: 'svelte' }
	],
	[
		'respects Svelte each, await, snippet, const and slot bindings',
		`<script>import { redirect } from '@sveltejs/kit';</script>
{#each items as redirect}{redirect()}{:else}{redirect()}{/each}
{#await promise then redirect}{redirect()}{:catch redirect}{redirect()}{/await}
{#snippet block(redirect)}{redirect()}{/snippet}
{#if condition}{@const redirect = () => {}}{redirect()}{/if}
<Component let:redirect>{redirect()}</Component>
{redirect()}`,
		[redirect, redirect, redirect],
		{ language: 'svelte' }
	],
	[
		'links Svelte module imports in the instance script and template',
		`<script module>import { redirect, type Load } from '@sveltejs/kit';</script>
<script lang="ts">let value: Load; redirect();</script>
{redirect()}`,
		[redirect, kit_load, kit_load, redirect, redirect],
		{ language: 'svelte' }
	],
	[
		'handles incomplete Svelte examples conservatively without linking commented scripts',
		`<!-- <script>import { redirect } from '@sveltejs/kit';</script> -->
<script>import { redirect } from '@sveltejs/kit'; redirect();</script>
{#if`,
		[redirect, redirect],
		{ language: 'svelte' }
	]
])('%s', (_, source, expected, { language = 'ts', module, prelude } = {}) => {
	expect(
		find_references(source, language, references, module, prelude).map(({ start, end, href }) =>
			link(source.slice(start, end), href)
		)
	).toEqual(expected);
});

describe('highlighted documentation links', () => {
	function render(code: string, language = 'dts') {
		return `<pre data-language="${language}"><code>${code}</code></pre>`;
	}

	test('resolves the removed and added halves of a diff example separately', () => {
		const stores = {
			'$app/stores': { page: '/docs/kit/$app-stores#page' },
			'$app/state': { page: '/docs/kit/$app-state#page' }
		};
		const remove = (code: string) => `<span class="highlight remove">${code}</span>`;
		const add = (code: string) => `<span class="highlight add">${code}</span>`;
		const html = link_references(
			render(
				`&lt;script&gt;
${remove(`import { page } from '$app/stores';`)}
${add(`import { page } from '$app/state';`)}
&lt;/script&gt;

${remove('{$page.data}')}
${add('{page.data}')}`,
				'svelte'
			),
			stores
		);

		expect(
			[...html.matchAll(/<a class="doc-reference" href="([^"]+)">([^<]+)<\/a>/g)].map(
				([, href, text]) => `${text} → ${href}`
			)
		).toEqual([
			`page → ${stores['$app/stores'].page}`,
			`page → ${stores['$app/state'].page}`,
			`$page → ${stores['$app/stores'].page}`,
			`page → ${stores['$app/state'].page}`
		]);
	});

	test('links a type inside a single comment token without changing visible text', () => {
		const html = render(`<span class="comment">/** @type {import('./$types').PageLoad} */</span>`);
		expect(link_references(html, references)).toBe(
			render(
				`<span class="comment">/** @type {import('./$types').<a class="doc-reference" href="${references['./$types']}">PageLoad</a>} */</span>`
			)
		);
	});

	test('balances token wrappers when one identifier spans multiple text nodes', () => {
		const html = render(
			`<span class="keyword">let</span> value: <span class="type">Lo</span><span class="type">ad</span>;`
		);
		const result = link_references(html, references, '@sveltejs/kit');
		expect(result).toContain(
			`<a class="doc-reference" href="${references['@sveltejs/kit'].Load}"><span class="type">Lo</span><span class="type">ad</span></a>`
		);
		expect(result.replace(/<[^>]*>/g, '')).toBe('let value: Load;');
	});

	test('does not decorate popover or query signatures, and is idempotent', () => {
		const html = render(
			`import { redirect } from '@sveltejs/kit';\n<span class="twoslash-hover"><span class="twoslash-target">redirect</span><span class="twoslash-popover"><span>Load redirect</span></span></span>();<span class="twoslash-query"><span>Load redirect</span></span>`,
			'ts'
		);
		const linked = link_references(html, references, '@sveltejs/kit');
		expect(linked.match(/class="doc-reference"/g)).toHaveLength(2);
		expect(linked).toContain('<span class="twoslash-popover"><span>Load redirect</span></span>');
		expect(linked).toContain('<span class="twoslash-query"><span>Load redirect</span></span>');
		expect(link_references(linked, references, '@sveltejs/kit')).toBe(linked);
	});

	test('preserves HTML entities and escapes destinations', () => {
		const html = render('let value: Load;&lt;T&gt;');
		const linked = link_references(html, { test: { Load: '/docs#Load?x="a"&y=1' } }, 'test');
		expect(linked).toContain('href="/docs#Load?x=&quot;a&quot;&amp;y=1"');
		expect(linked).toContain('&lt;T&gt;');
	});
});
