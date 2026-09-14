// Publishes the playground lexicons as `com.atproto.lexicon.schema` records so the
// NSIDs resolve network-wide (the authorization server needs the space declaration).
// Point `_lexicon.<authority domain>` TXT at the publishing DID (`did=did:plc:...`).
//
// ATPROTO_LEXICON_PASSWORD=<app password> node scripts/atproto-publish-lexicons.js
import fs from 'node:fs';
import path from 'node:path';

// @svelte.dev
const SVELTE_DID = 'did:plc:b6gbde64ngpelprsvnphc2l2';

const did = SVELTE_DID;
const password = process.env.ATPROTO_LEXICON_PASSWORD;

if (!password) {
	console.error('ATPROTO_LEXICON_PASSWORD is required');
	process.exit(1);
}

const dir = path.resolve('src/lib/atproto/lexicons');

const doc_res = await fetch(`https://plc.directory/${did}`);
if (!doc_res.ok) throw new Error(`could not resolve ${did}`);
const doc = await doc_res.json();
const pds = doc.service.find(
	(/** @type {{ id: string }} */ s) => s.id === '#atproto_pds'
).serviceEndpoint;
const xrpc = (/** @type {string} */ method) => new URL(`/xrpc/${method}`, pds);

const session_res = await fetch(xrpc('com.atproto.server.createSession'), {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ identifier: did, password })
});
if (!session_res.ok) throw new Error(`createSession failed: ${await session_res.text()}`);
const { accessJwt } = await session_res.json();

for (const file of fs.readdirSync(dir)) {
	const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
	const lexicon = JSON.parse(raw);

	const res = await fetch(xrpc('com.atproto.repo.putRecord'), {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Bearer ${accessJwt}` },
		body: JSON.stringify({
			repo: did,
			collection: 'com.atproto.lexicon.schema',
			rkey: lexicon.id,
			record: { $type: 'com.atproto.lexicon.schema', ...lexicon }
		})
	});
	if (!res.ok) throw new Error(`putRecord ${lexicon.id} failed: ${await res.text()}`);
	console.log(`published ${(await res.json()).uri}`);
}
