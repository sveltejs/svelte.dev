export function entries() {
	// These are not findable by the crawler, but we need to know about them for redirects
	return [
		// So that redirects from these URLs to /tutorial/<svelte/kit>/... work
		{ slug: 'svelte' },
		{ slug: 'kit' },
		// So that /tutorial/ redirects to /tutorial
		{ slug: '' }
	];
}
