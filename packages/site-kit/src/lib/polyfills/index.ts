// Some polyfills for things used throughout the app for better browser compat

if (!Array.prototype.at) {
	Array.prototype.at = /** @param {number} index */ function (index) {
		return this[index >= 0 ? index : this.length + index];
	};
}

if (!Promise.withResolvers) {
	Promise.withResolvers = function () {
		let resolve: any, reject: any;
		const promise = new Promise<any>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		return { resolve, reject, promise };
	};
}
