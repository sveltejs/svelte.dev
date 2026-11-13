/** fades in the screenshots that have not loaded or started to show when the page starts */
export function fade_in(node: HTMLElement) {
	const images = [...node.querySelectorAll('img')].filter(
		(img) => !img.complete && img.naturalWidth === 0
	);

	const show = (event: Event) => {
		(event.currentTarget as HTMLImageElement).style.opacity = '';
	};

	for (const img of images) {
		img.style.opacity = '0';
		img.addEventListener('load', show);
		img.addEventListener('error', show);
	}

	return () => {
		for (const img of images) {
			img.removeEventListener('load', show);
			img.removeEventListener('error', show);
		}
	};
}
