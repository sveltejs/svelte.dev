// we fetch the schema from the opencode repo so that it's nicer to see https://svelte.dev/opencode/schema.json
// instead of all of that github stuff

export async function GET({ fetch }) {
	return new Response(
		await fetch(
			'https://raw.githubusercontent.com/sveltejs/ai-tools/refs/heads/main/packages/opencode/schema.json'
		).then((res) => res.text()),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}
