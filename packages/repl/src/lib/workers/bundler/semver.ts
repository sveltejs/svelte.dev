// https://devhints.io/semver
export function max(version: string) {
	if (!version || version === '*' || version === 'x') {
		return 'latest';
	}

	// strip any * parts, e.g. 1.2.x becomes 1.2
	version = version.replace(/\.[x*].+/, '');

	const match = /^([~^])?(\d+|[*x])(?:\.(\d+|[*x])(?:\.(\d+|[*x]))?)?(?:-.+)?$/.exec(version);

	if (!match) {
		// bail
		console.warn(`Could not resolve version from ${version}`);
		return 'latest';
	}

	const [_, qualifier, major, minor] = match;

	// ^ means 'same major', unless 0.x
	if (qualifier === '^') {
		if (major === '0') {
			if (minor === '0') {
				return version.slice(1);
			}

			return `${major}.${minor}`;
		}

		return major;
	}

	// ~ means 'same minor'
	if (qualifier === '~') {
		if (minor !== undefined) {
			return `${major}.${minor}`;
		}

		return major;
	}

	return version;
}
