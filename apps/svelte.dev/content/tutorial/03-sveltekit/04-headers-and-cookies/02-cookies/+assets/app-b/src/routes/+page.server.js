export function load({ cookies }) {
	const visited = cookies.get('visited');

	cookies.set('visited', 'true');

	return {
		visited
	};
}
