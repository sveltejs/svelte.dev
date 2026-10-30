export const session_storage = {
	get(key: string) {
		try {
			return sessionStorage.getItem(key);
		} catch {
			// sessionStorage access disabled
		}
	},

	set(key: string, value: string) {
		try {
			return sessionStorage.setItem(key, value);
		} catch {
			// sessionStorage access disabled
		}
	},

	remove(key: string) {
		try {
			return sessionStorage.removeItem(key);
		} catch {
			// sessionStorage access disabled
		}
	}
};
