import { defineParams } from '@sveltejs/kit/params';

const reserved_endpoints = new Set(['llms.txt', 'llms-small.txt']);

export const params = defineParams({
	documentation(param) {
		const final_segment = param.split('/').at(-1);
		return !final_segment || !reserved_endpoints.has(final_segment) ? param : undefined;
	}
});
