import { describe, expect, test } from 'vitest';
import { indent_multiline_comments, smart_quotes } from './utils';

describe('indent_multiline_comments', () => {
	test.each([
		'<span class="comment">/**\n * A multiline comment\n */</span>\nconst cache = 1;',
		'\t<span class="comment">// Cache the files</span>\n\tconst cache = 1;',
		'\t<span class="tok comment">// Cache the files</span>\n\tconst cache = 1;',
		'\t<span class="comment">// Try the network first</span>\n\t<span class="comment">// Fall back to the cache</span>\n\tconst cache = 1;',
		'\t<span class="comment">/* Cache the files\n\t * for offline use */</span>\n\tconst cache = 1;',
		'\n\t<span class="comment">// Cache the files</span>\n\n\tconst cache = 1;'
	])('preserves the text content of %s', (html) => {
		const wrapped = indent_multiline_comments(html);

		expect(wrapped).toContain('class="comment wrapped"');
		expect(wrapped.replace(/<[^>]*>/g, '')).toBe(html.replace(/<[^>]*>/g, ''));
	});
});

describe('smart_quotes', () => {
	test.each([
		["Vite's built-in handling", 'Vite’s built-in handling'],
		[`"Vite's built-in handling"`, '“Vite’s built-in handling”'],
		['<script lang="ts">', '<script lang=“ts”>'],
		['He said "hello".', 'He said “hello”.'],
		['"one" and "two"', '“one” and “two”'],
		["'one' and 'two'", '‘one’ and ‘two’'],
		['It\'s "fine"', 'It’s “fine”'],
		['("nested")', '(“nested”)']
	])('converts %s', (input, expected) => {
		expect(smart_quotes(input)).toBe(expected);
	});

	test('respects text token boundaries', () => {
		expect(smart_quotes('"after code"', { first: false })).toBe('”after code”');
	});
});
