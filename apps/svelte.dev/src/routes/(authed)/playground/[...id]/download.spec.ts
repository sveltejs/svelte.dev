import { describe, expect, it } from 'vitest';
import { configure_async_download } from './download.js';

const vite_config = `export default defineConfig({
\tplugins: [
\t\tsveltekit({
\t\t\tcompilerOptions: {
\t\t\t\trunes: true
\t\t\t}
\t\t})
\t]
});`;

describe('configure_async_download', () => {
	it('enables experimental async compilation', () => {
		const files = [{ path: 'vite.config.ts', data: vite_config }];

		configure_async_download(files, true);

		expect(files[0].data).toContain('experimental: { async: true },');
	});

	it('leaves the template unchanged when async mode is disabled', () => {
		const files = [{ path: 'vite.config.ts', data: vite_config }];

		configure_async_download(files, false);

		expect(files[0].data).toBe(vite_config);
	});

	it('fails when the template no longer exposes compiler options', () => {
		const files = [{ path: 'vite.config.ts', data: 'export default defineConfig({});' }];

		expect(() => configure_async_download(files, true)).toThrow(
			'The download template is missing Svelte compiler options'
		);
	});
});
