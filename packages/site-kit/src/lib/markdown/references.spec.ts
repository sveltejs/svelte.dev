import { describe, expect, test } from 'vitest';
import { find_references, link_references, type DocumentationReferences } from './references.ts';

const references = {
	'@sveltejs/kit': {
		AfterNavigate: '/docs/kit/@sveltejs-kit#AfterNavigate',
		Load: '/docs/kit/@sveltejs-kit#Load',
		redirect: '/docs/kit/@sveltejs-kit#redirect'
	},
	svelte: { onMount: '/docs/svelte/svelte#onMount', Load: '/docs/svelte/svelte#Load' },
	'./$types': '/docs/kit/types#Generated-types'
} satisfies DocumentationReferences;

function resolve(source: string, language = 'ts', module?: string, prelude?: string) {
	return find_references(source, language, references, module, prelude).map(
		({ start, end, href }) => ({
			text: source.slice(start, end),
			href
		})
	);
}

const redirect = { text: 'redirect', href: references['@sveltejs/kit'].redirect };

describe('documentation references', () => {
	test('links imported functions and their usages, not strings, comments or locals', () => {
		expect(
			resolve(`import { redirect } from '@sveltejs/kit';
redirect(303, '/');
const text = 'redirect';
// redirect
function local(redirect: () => void) { redirect(); }
const unrelated = { redirect: 1 };
unrelated.redirect;
`)
		).toEqual([redirect, redirect]);
	});

	test('resolves aliases to the exported name and separates module collisions', () => {
		expect(
			resolve(`import { redirect as go, type Load } from '@sveltejs/kit';
import { Load as OtherLoad } from 'svelte';
go(303, '/');
let load: Load;
let other: OtherLoad;`)
		).toEqual([
			redirect,
			{ text: 'go', href: redirect.href },
			{ text: 'Load', href: references['@sveltejs/kit'].Load },
			{ text: 'Load', href: references.svelte.Load },
			{ text: 'OtherLoad', href: references.svelte.Load },
			{ text: 'go', href: redirect.href },
			{ text: 'Load', href: references['@sveltejs/kit'].Load },
			{ text: 'OtherLoad', href: references.svelte.Load }
		]);
	});

	test('links namespace members without linking the namespace or nested properties', () => {
		expect(
			resolve(`import * as Kit from '@sveltejs/kit';
Kit.redirect(303, '/');
let type: Kit.AfterNavigate;
Kit.redirect.name;
function local(Kit: any) { Kit.redirect(); }`)
		).toEqual([
			redirect,
			{ text: 'AfterNavigate', href: references['@sveltejs/kit'].AfterNavigate },
			redirect
		]);
	});

	test.each(['ts', 'js'])('resolves import types and JSDoc in %s', (language) => {
		const source = `/** @type {import('./$types').PageLoad} */
export const load = () => ({});
/** @satisfies {import('./$types').FutureRouteType} */
export const actions = {};
let navigation: import('@sveltejs/kit').AfterNavigate;`;
		expect(resolve(source, language)).toEqual([
			{ text: 'PageLoad', href: references['./$types'] },
			{ text: 'FutureRouteType', href: references['./$types'] },
			{ text: 'AfterNavigate', href: references['@sveltejs/kit'].AfterNavigate }
		]);
	});

	test('links new generated exports, aliases and namespace members without linking shadowed locals', () => {
		expect(
			resolve(`import type { FutureRouteType as Data } from './$types';
import * as Route from './$types';
let data: Data;
let event: Route.FutureRouteEvent;
function local<Data>(value: Data): Data { return value; }`)
		).toEqual(
			['FutureRouteType', 'Data', 'Data', 'FutureRouteEvent'].map((text) => ({
				text,
				href: references['./$types']
			}))
		);
	});

	test('uses the current module only for unbound declaration type references', () => {
		expect(
			resolve(
				`function afterNavigate(callback: (navigation: import('@sveltejs/kit').AfterNavigate) => void): void;
function fn(value: Load): Load;
function shadow<Load>(value: Load): Load;
interface Local {}
function local(value: Local): void;`,
				'dts',
				'@sveltejs/kit'
			)
		).toEqual([
			{ text: 'AfterNavigate', href: references['@sveltejs/kit'].AfterNavigate },
			{ text: 'Load', href: references['@sveltejs/kit'].Load },
			{ text: 'Load', href: references['@sveltejs/kit'].Load }
		]);
	});

	test('does not guess destinations for undocumented imports or arbitrary local types', () => {
		expect(
			resolve(`import { redirect } from 'other';
import type { PageLoad } from './local';
redirect();
let load: PageLoad;
let value: Load;`)
		).toEqual([]);
	});

	test('keeps type-parameter and block-local shadowing separate from imports', () => {
		expect(
			resolve(`import { redirect, type Load } from '@sveltejs/kit';
function fn<Load>(value: Load) {}
{ const redirect = () => {}; redirect(); }
redirect(303, '/');
let value: Load;`)
		).toEqual([
			redirect,
			{ text: 'Load', href: references['@sveltejs/kit'].Load },
			redirect,
			{ text: 'Load', href: references['@sveltejs/kit'].Load }
		]);
	});

	test('uses hidden imports without linking hidden source', () => {
		expect(
			resolve(
				`redirect(303, '/');`,
				'ts',
				undefined,
				`import { redirect } from '@sveltejs/kit';\n// ---cut---\n`
			)
		).toEqual([redirect]);
	});

	test('links imported shorthand values, not destructured or property bindings', () => {
		expect(
			resolve(`import { redirect } from '@sveltejs/kit';
const value = { redirect };
function fn({ redirect }: any) { return { redirect }; }
const other = { redirect() {} };`)
		).toEqual([redirect, redirect]);
	});

	test('uses only the final hidden virtual file for import bindings', () => {
		expect(
			resolve(
				'redirect();',
				'ts',
				undefined,
				`// @filename: helper.ts\nimport { redirect } from '@sveltejs/kit';\n// @filename: index.ts\n`
			)
		).toEqual([]);
	});

	test('links Svelte expressions and attributes, not text, comments or styles', () => {
		expect(
			resolve(
				`<script>import { redirect } from '@sveltejs/kit';</script>
<button onclick={() => redirect(303, '/')}>{redirect.name}</button>
<p>redirect</p><!-- <script>import { redirect } from '@sveltejs/kit';</script> -->
<style>redirect { color: red; }</style>`,
				'svelte'
			)
		).toEqual([redirect, redirect, redirect]);
	});

	test('respects Svelte each, await, snippet, const and slot bindings', () => {
		expect(
			resolve(
				`<script>import { redirect } from '@sveltejs/kit';</script>
{#each items as redirect}{redirect()}{:else}{redirect()}{/each}
{#await promise then redirect}{redirect()}{:catch redirect}{redirect()}{/await}
{#snippet block(redirect)}{redirect()}{/snippet}
{#if condition}{@const redirect = () => {}}{redirect()}{/if}
<Component let:redirect>{redirect()}</Component>
{redirect()}`,
				'svelte'
			)
		).toEqual([redirect, redirect, redirect]);
	});

	test('inherits unshadowed Svelte module imports in scripts and template expressions', () => {
		expect(
			resolve(
				`<script module>import { redirect, type Load } from '@sveltejs/kit';</script>
<script lang="ts">import type { Load } from 'svelte'; let value: Load; redirect();</script>
{redirect()}`,
				'svelte'
			)
		).toEqual([
			redirect,
			{ text: 'Load', href: references['@sveltejs/kit'].Load },
			{ text: 'Load', href: references.svelte.Load },
			{ text: 'Load', href: references.svelte.Load },
			redirect,
			redirect
		]);
	});

	test('separates Svelte module and instance bindings with the same imported name', () => {
		expect(
			resolve(
				`<script module>import type { Load } from 'svelte'; let value: Load;</script>
<script lang="ts">import type { Load } from '@sveltejs/kit'; let value: Load;</script>`,
				'svelte'
			)
		).toEqual([
			{ text: 'Load', href: references.svelte.Load },
			{ text: 'Load', href: references.svelte.Load },
			{ text: 'Load', href: references['@sveltejs/kit'].Load },
			{ text: 'Load', href: references['@sveltejs/kit'].Load }
		]);
	});

	test('handles incomplete Svelte examples conservatively without linking commented scripts', () => {
		expect(
			resolve(
				`<!-- <script>import { redirect } from '@sveltejs/kit';</script> -->
<script>import { redirect } from '@sveltejs/kit'; redirect();</script>
{#if`,
				'svelte'
			)
		).toEqual([redirect, redirect]);
	});
});

describe('highlighted documentation links', () => {
	function render(code: string, language = 'dts') {
		return `<pre data-language="${language}"><code>${code}</code></pre>`;
	}

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
