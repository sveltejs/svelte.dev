import { PRERENDER } from '$env/static/private';

// by default, all pages are prerendered
export const prerender = PRERENDER !== 'false';
