import { describe, expect, test } from 'vitest';
import { smart_quotes } from './utils';

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
