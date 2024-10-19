let previous = 50;
let data = [];

function next() {
	const value = previous + Math.random() - 0.4;
	previous = value;

	return value;
}

for (let i = 0; i < 100; i += 1) {
	data.push(next());
}

export function poll() {
	return data = [...data.slice(1), next()];
}
