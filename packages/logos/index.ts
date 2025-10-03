const glob = import.meta.glob('./logos/*', {
	import: 'default',
	eager: true
});

export const logos: Record<string, string> = Object.fromEntries(
	Object.entries(glob).map(([key, value]) => [
		key.slice('./logos/'.length).replace(/\.(svg|png|jpg)/, ''),
		value as string
	])
);
