import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	hex(value) {
		return /^[0-9a-f]{6}$/.test(value) ? value : undefined;
	}
});
