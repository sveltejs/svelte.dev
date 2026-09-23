/** @param {string} param */
export function match(param) {
	const final_segment = param.split('/').at(-1);
	return final_segment !== 'llms.txt' && final_segment !== 'llms-small.txt';
}
