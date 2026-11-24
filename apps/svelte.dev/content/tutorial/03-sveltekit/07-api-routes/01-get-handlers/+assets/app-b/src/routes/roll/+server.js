export function GET() {
	const number = Math.floor(Math.random() * 6) + 1;

	return Response.json(number);
}
