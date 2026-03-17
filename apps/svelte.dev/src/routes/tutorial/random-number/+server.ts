import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const min = +(url.searchParams.get('min') ?? '0');
	const max = +(url.searchParams.get('max') ?? '100');

	// simulate a long delay
	await new Promise((res) => setTimeout(res, 1000));

	// fail sometimes
	if (Math.random() < 0.333) {
		return new Response(`Failed to generate random number. Please try again`, {
			status: 400,
			headers: { 'Access-Control-Allow-Origin': '*' }
		});
	}

	const num = min + Math.round(Math.random() * (max - min));
	return new Response(String(num), {
		headers: { 'Access-Control-Allow-Origin': '*' }
	});
};
