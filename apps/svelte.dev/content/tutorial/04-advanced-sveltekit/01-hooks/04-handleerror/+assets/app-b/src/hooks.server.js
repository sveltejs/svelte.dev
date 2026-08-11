export function handleError({ kind, error }) {
	if (kind !== 'unknown') return;

	console.error(error);

	return {
		message: 'everything is fine',
		code: 'JEREMYBEARIMY'
	};
}
