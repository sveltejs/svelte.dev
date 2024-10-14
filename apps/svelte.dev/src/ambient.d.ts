declare module 'd3-geo-projection';
declare module 'topojson-client';

// remove this once enhanced-img fixed its ambient types
declare module '*?enhanced' {
	import type { Picture } from 'vite-imagetools';
	const value: Picture;
	export default value;
}
