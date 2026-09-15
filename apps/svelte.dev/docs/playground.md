# Playground: saving apps

An app can be saved to one of three places. The user picks a default in `/accounts`; saving an app that lives elsewhere copies it to the default.

| Destination                | Account | Storage                                                       |
| -------------------------- | ------- | ------------------------------------------------------------- |
| GitHub                     | GitHub  | Supabase `gist` table                                         |
| Atmosphere public          | atproto | `dev.svelte.playground` record on the user's PDS              |
| Atmosphere private (alpha) | atproto | same record, inside the space `dev.svelte.playground.private` |

Public atproto apps are readable by anyone at `/playground/<handle>/<rkey>` and listed at `/apps/<handle>`.

## atproto: no server state

The OAuth client is a public browser client (`@atcute/oauth-browser-client`): tokens live in the user's localStorage and all writes go from the browser straight to their PDS. The server only resolves handles (`/auth/atproto/identity`), serves `client-metadata.json`, and reads public records for SSR. Private apps are read in the browser by their owner.

Public clients get a ~2 week session from the PDS: the user menu offers a renewal after 13 days, and a save that hits an expired session re-opens the login popup and retries.

## Dev

No database needed:

- GitHub: create an [OAuth app](https://github.com/settings/developers) with callback `http://127.0.0.1:5173/auth/callback`, put `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in `.env.local`. Sessions and apps go to `tmp/playground.json`.
- atproto: nothing to configure. The OAuth client is a loopback client, so open the site on `http://127.0.0.1:5173` (not `localhost`).

## Prod

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

Nothing for atproto.

## Lexicons

Two NSIDs, source in `src/lib/atproto/lexicons/`, published as `com.atproto.lexicon.schema` records on the @svelte.dev repo (`did:plc:b6gbde64ngpelprsvnphc2l2`):

| NSID                            | What                                                              | Published record                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `dev.svelte.playground`         | record: name, files, tailwind, svelteVersion, timestamps          | [pdsls](https://pdsls.dev/at://did:plc:b6gbde64ngpelprsvnphc2l2/com.atproto.lexicon.schema/dev.svelte.playground) (missing) |
| `dev.svelte.playground.private` | space declaration holding private `dev.svelte.playground` records | [pdsls](https://pdsls.dev/at://did:plc:b6gbde64ngpelprsvnphc2l2/com.atproto.lexicon.schema/dev.svelte.playground.private)   |

Resolution: `_lexicon.svelte.dev` and `_lexicon.playground.svelte.dev` TXT -> `did=did:plc:b6gbde64ngpelprsvnphc2l2` (both set). The authorization server only grants the `space:` scope if the space NSID resolves to a published declaration; the record lexicon is optional for writes but should be published too so the collection is discoverable.

Publish or update both: `ATPROTO_LEXICON_PASSWORD=<app password of @svelte.dev> pnpm atproto:publish-lexicons`

A user's apps are browsable on pdsls at `https://pdsls.dev/at://<handle>/dev.svelte.playground`.

Spaces are an atproto alpha: only accounts on a PDS running a spaces build can enable private apps, `/accounts` shows the status.
