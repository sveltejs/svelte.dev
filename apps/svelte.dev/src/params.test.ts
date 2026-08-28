import { describe, expect, it } from 'vitest';
import { params } from './params.ts';

const match = async (param: string) =>
	!(await params.documentation['~standard'].validate(param)).issues;

describe('documentation path matcher', () => {
	it.each(['', 'overview', 'runtime/stores', 'llms.txt-guide', 'reference.txt'])(
		'accepts %j as a documentation path',
		async (path) => {
			expect(await match(path)).toBe(true);
		}
	);

	it.each(['llms.txt', 'llms-small.txt', 'runes/$state/llms.txt', 'configuration/llms-small.txt'])(
		'reserves the LLM endpoint path %j',
		async (path) => {
			expect(await match(path)).toBe(false);
		}
	);
});
