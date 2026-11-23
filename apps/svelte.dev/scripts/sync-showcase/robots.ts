/** the robots.txt of each origin asked about so far */
const fetched = new Map<string, Promise<string>>();

/**
 * whether the rules a robots.txt gives every visitor let a path be loaded: the longest rule that
 * matches decides, and of two as long the one that allows
 */
export function allows(robots: string, path: string) {
	const rules: Array<{ allow: boolean; pattern: string }> = [];

	// rules belong to the user agents named on the lines just before them
	let agents: string[] = [];
	let naming = false;

	for (const line of robots.split(/\r?\n/)) {
		const [, field, value] = /^\s*([a-z-]+)\s*:\s*(.*?)\s*(?:#.*)?$/i.exec(line) ?? [];
		if (!field) continue;

		if (field.toLowerCase() === 'user-agent') {
			if (!naming) agents = [];
			agents.push(value);
			naming = true;
			continue;
		}

		naming = false;

		const allow = field.toLowerCase() === 'allow';
		if ((allow || field.toLowerCase() === 'disallow') && value && agents.includes('*')) {
			rules.push({ allow, pattern: value });
		}
	}

	let best: { allow: boolean; pattern: string } | undefined;

	for (const rule of rules) {
		// * stands for anything, and $ at the end for the end of the path
		const source = rule.pattern
			.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
			.replace(/\*/g, '.*')
			.replace(/\\\$$/, '$');

		if (!new RegExp(`^${source}`).test(path)) continue;

		if (
			!best ||
			rule.pattern.length > best.pattern.length ||
			(rule.pattern.length === best.pattern.length && rule.allow)
		) {
			best = rule;
		}
	}

	return best?.allow ?? true;
}

/** whether a site's robots.txt lets a page be loaded by a script. one with none allows it */
export async function permitted(url: string) {
	const { origin, pathname, search } = new URL(url);

	if (!fetched.has(origin)) {
		fetched.set(
			origin,
			fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(10_000) })
				.then((response) => (response.ok ? response.text() : ''))
				.catch(() => '')
		);
	}

	return allows(await fetched.get(origin)!, pathname + search);
}
