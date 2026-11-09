import fs from 'node:fs';
import path from 'node:path';

export const SCREENSHOTS = path.resolve(
	import.meta.dirname,
	'../../src/routes/showcase/screenshots'
);
export const CLIPS = path.resolve(import.meta.dirname, '../../src/routes/showcase/clips');
const EXTENSIONS = ['jpg', 'png', 'webp'];

export const VIEWPORT = { width: 1440, height: 900 };

// taller than the window, since the first site in each category is shown taller than 1440x900
export const SIZE = { width: 1440, height: 1440 };

export function find_screenshot(id: string) {
	return screenshot_files(id).some((file) => fs.existsSync(file));
}

/** every file the screenshot of a site could be, with @2x on the ones taken at twice the size */
export function screenshot_files(id: string) {
	return [id, `${id}@2x`].flatMap((name) =>
		EXTENSIONS.map((extension) => path.join(SCREENSHOTS, `${name}.${extension}`))
	);
}
