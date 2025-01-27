export async function roll() {
	// Fetch a random number from 1 to 6
	// (with a delay, so that we can see it)
	return new Promise((fulfill, reject) => {
		setTimeout(() => {
			// simulate a flaky network
			if (Math.random() < 0.3) {
				reject(new Error('Request failed'));
				return;
			}

			fulfill(Math.ceil(Math.random() * 6));
		}, 1000);
	});
}
