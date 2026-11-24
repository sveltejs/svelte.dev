export function handleError({ kind, error }) {
	if (kind === 'unknown') {
		return { message: error instanceof Error ? error.message : 'Internal Error' };
	}
}
