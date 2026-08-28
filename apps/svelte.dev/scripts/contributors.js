// @ts-check

/**
 * @typedef {{ login: string, contributions: number }} Contributor
 */

/**
 * Selects contributors fairly across repositories while preserving each repository's ranking.
 * @param {Contributor[][]} contributor_lists
 * @param {number} max
 */
export function select_contributors(contributor_lists, max) {
	const lists = contributor_lists.map((contributors) =>
		contributors.filter(({ login }) => !login.includes('[bot]'))
	);
	const indices = lists.map(() => 0);
	const selected = [];
	const selected_logins = new Set();

	while (selected.length < max) {
		let advanced = false;

		for (let i = 0; i < lists.length && selected.length < max; i += 1) {
			while (indices[i] < lists[i].length) {
				const contributor = lists[i][indices[i]++];
				advanced = true;

				if (selected_logins.has(contributor.login)) continue;

				selected.push(contributor);
				selected_logins.add(contributor.login);
				break;
			}
		}

		if (!advanced) break;
	}

	return selected;
}
