import { describe, expect, it } from 'vitest';
import { is_sveltekit_virtual_module } from './sveltekit';

describe('is_sveltekit_virtual_module', () => {
	it.each([
		'$app/environment',
		'$app/state',
		'$env/dynamic/private',
		'$env/static/public',
		'$lib',
		'$lib/components/Button.svelte',
		'$service-worker'
	])('recognizes %s', (id) => {
		expect(is_sveltekit_virtual_module(id)).toBe(true);
	});

	it.each(['$application', '$environment', '$library', '$service-worker-extra', 'svelte'])(
		'does not match %s',
		(id) => {
			expect(is_sveltekit_virtual_module(id)).toBe(false);
		}
	);
});
