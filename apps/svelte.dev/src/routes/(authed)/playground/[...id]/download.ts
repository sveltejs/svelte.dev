type DownloadFile = {
	path: string;
	data: string;
};

const COMPILER_OPTIONS = 'compilerOptions: {';

export function configure_async_download(files: DownloadFile[], async_mode: boolean): void {
	if (!async_mode) return;

	const vite_config = files.find((file) => file.path === 'vite.config.ts');
	if (!vite_config) {
		throw new Error('The download template is missing vite.config.ts');
	}

	if (!vite_config.data.includes(COMPILER_OPTIONS)) {
		throw new Error('The download template is missing Svelte compiler options');
	}

	vite_config.data = vite_config.data.replace(
		COMPILER_OPTIONS,
		`${COMPILER_OPTIONS}\n\t\t\t\texperimental: { async: true },`
	);
}
