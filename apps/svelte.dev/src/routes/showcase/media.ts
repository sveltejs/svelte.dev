import type { Picture } from '@sveltejs/enhanced-img';
import { sites } from './sites.ts';

// the globs are written out in full each time, since vite reads them before the code runs

const screenshots = {
	...import.meta.glob<Picture>(['./screenshots/*.{jpg,png,webp}', '!./screenshots/*@2x.*'], {
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '480;960;1440' }
	}),
	// the wider ones are taken at twice the size, so they get widths to match
	...import.meta.glob<Picture>('./screenshots/*@2x.{jpg,png,webp}', {
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '480;960;1440;1920;2880' }
	})
};

// the top of each, which is all that shows until you point at one. the wider ones go in the large
// cards, which are as tall as 0.87:1 where they are tallest, so theirs are cut at 4:5, taller than
// that, to fill the card by its width as the whole one does once it scrolls rather than by its
// height, which would zoom it in and jump as the whole one takes its place
const crops = {
	...import.meta.glob<Picture>(['./screenshots/*.{jpg,png,webp}', '!./screenshots/*@2x.*'], {
		eager: true,
		import: 'default',
		query: { enhanced: true, w: '480;960;1440', aspect: '16:10', fit: 'cover', position: 'top' }
	}),
	...import.meta.glob<Picture>('./screenshots/*@2x.{jpg,png,webp}', {
		eager: true,
		import: 'default',
		query: {
			enhanced: true,
			w: '480;960;1440;1920;2880',
			aspect: '4:5',
			fit: 'cover',
			position: 'top'
		}
	})
};

/** the id of the site a screenshot or clip is of, from its file name */
function id_of(path: string) {
	return path.replace(/^.*\/|(@2x)?\.\w+$/g, '');
}

function by_id<T>(files: Record<string, T>): Record<string, T> {
	return Object.fromEntries(Object.entries(files).map(([path, file]) => [id_of(path), file]));
}

/** whole screenshots by site id, which the page scrolls down on hover */
export const pictures = by_id(screenshots);

/**
 * the tops of the screenshots by site id, or the whole of one shown from somewhere else, or of
 * one no taller than its top, which cropping to 4:5 would cut at the sides instead
 */
export const tops: Record<string, Picture> = Object.fromEntries(
	Object.entries(by_id(crops)).map(([id, crop]) => {
		const whole = pictures[id];
		const position = sites.find((site) => site.id === id)?.screenshot?.position;
		return [id, position || whole.img.h / whole.img.w <= 5 / 4 ? whole : crop];
	})
);

/** the recordings of sites whose motion a screenshot misses, by site id */
export const clips = by_id(
	import.meta.glob<string>('./clips/*.mp4', { eager: true, import: 'default', query: '?url' })
);

/** tiny inline versions of the screenshots by site id, shown blurred until the screenshot loads */
export const placeholders: Record<string, string> = Object.fromEntries(
	Object.entries(
		by_id(
			import.meta.glob<string>('./screenshots/*.{jpg,png,webp}', {
				eager: true,
				import: 'default',
				query: '?w=16&format=webp&inline'
			})
		)
	).map(([id, src]) => [id, `url(${src})`])
);

/** sites whose clips scroll down the page, which only play when pointed at or focused */
export const scrolling = new Set(
	sites.filter((site) => typeof site.clip === 'object' && site.clip.travel).map((site) => site.id)
);
