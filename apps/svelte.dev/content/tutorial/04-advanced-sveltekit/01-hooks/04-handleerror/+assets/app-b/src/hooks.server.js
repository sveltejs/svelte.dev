export function handleError({ kind, error }) {
	if (kind === 'unknown') {
		console.error(error);

		return {
			message: 'everything is fine',
			code: 'JEREMYBEARIMY'
		};
	}
}
