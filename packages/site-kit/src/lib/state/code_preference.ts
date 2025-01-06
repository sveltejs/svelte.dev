import { Persisted } from './Persisted.svelte';

export const code_preference = new Persisted<'typescript' | 'javascript'>(
	'sv:code_preference',
	'typescript'
);
