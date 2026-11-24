export function handleError({ kind, error }) {
	if (kind === 'unknown') {
		console.error(error);
	}
}
