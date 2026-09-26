# Playground: saving apps

An app can be saved to one of three places. The user picks a default in `/accounts`: new apps and forks go there, and saving an app you own updates it where it lives. Saving someone else's app copies it to the default.

| Destination                | Account | Storage                                                       |
| -------------------------- | ------- | ------------------------------------------------------------- |
| GitHub                     | GitHub  | Supabase `gist` table                                         |
| Atmosphere public          | atproto | `dev.svelte.playground` record on the user's PDS              |
| Atmosphere private (alpha) | atproto | same record, inside the space `dev.svelte.playground.private` |

Public atproto apps are readable by anyone at `/playground/<handle>/<rkey>` and listed at `/apps/<handle>`.

## atproto: server-side, through airspace

The model lives in `src/lib/atproto/lexicons.ts` + `model.ts` ([airspace](https://getair.space)). Login is OAuth with a public client (`airspace/oauth` over `@atproto/oauth-client-node`): tokens stay on the server, every PDS call happens in `+server` / `+page.server` (`src/lib/atproto/apps.ts`), and the browser only talks to our API (`src/lib/apps.ts`).

Server state is one key/value store (`src/lib/atproto/store.ts`): OAuth state + sessions (keyed by DID), login sessions (`atsid` cookie, like the GitHub `sid`) and the cached profile. Rows untouched for 60 days are swept on login (logins expire at 30).

A PDS filters and offsets nothing: it pages by cursor, so a listing walks the repo and search and paging happen here. A walk stops at the 500 newest records (`MAX_RECORDS`) and the tab count then reads `500+`; the GitHub list needs no such cap because Supabase pages and searches server-side. Anonymous clients are reused per identity for their read cache (10s, dropped on a write by the owner in the same process). Sessions are never reused, so an expired one still surfaces on the next request.

An app is saved where it lives; moving one between public and private is a copy from `/apps` followed by a delete.

Authenticated endpoints go through `with_user` (`src/lib/atproto/endpoint.ts`): a dead OAuth session (refresh token expired, app revoked on the PDS) clears the login and answers 401, which the browser (`with_reauth` in `src/lib/apps.ts`) turns into a login popup and one retry. Batch actions retry one app at a time, so a session that dies halfway through copies nothing twice.

## Dev

No database needed:

- GitHub: create an [OAuth app](https://github.com/settings/developers) with callback `http://127.0.0.1:5173/auth/callback`, put `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in `.env.local`. Sessions and apps go to `tmp/playground.json`.
- atproto: nothing to configure, the store falls back to `tmp/playground.json` (same file as the GitHub stand-in). The OAuth client is a loopback client, so open the site on `http://127.0.0.1:5173` (not `localhost`; the login page redirects).

## Prod

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

atproto needs one extra table:

```sql
create table atproto_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
```

## Lexicons

Two NSIDs, published as `com.atproto.lexicon.schema` records on the @svelte.dev repo (`did:plc:b6gbde64ngpelprsvnphc2l2`):

| NSID                            | What                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| `dev.svelte.playground`         | record: name, files, tailwind, svelteVersion, timestamps          |
| `dev.svelte.playground.private` | space declaration holding private `dev.svelte.playground` records |

Resolution: `_lexicon.svelte.dev` and `_lexicon.playground.svelte.dev` TXT -> `did=did:plc:b6gbde64ngpelprsvnphc2l2`. The authorization server only grants the `space:` scope if the space NSID resolves to a published declaration.

Publish or update both straight from the TypeScript model (app password of @svelte.dev):

```
AIRSPACE_APP_PASSWORD=... npx airspace lexicons publish --identity svelte.dev --lexicons src/lib/atproto/lexicons.ts
```

A user's apps are browsable on pdsls at `https://pdsls.dev/at://<handle>/dev.svelte.playground`.

Spaces are an atproto alpha: only accounts on a PDS running a spaces build can enable private apps, `/accounts` shows the status (`space.supported()`, an unauthenticated probe of the PDS). The space scope is asked for again on every later login of an account that enabled it (the profile row outlives the login), and `manage.ensure()` is one read when the space is already there.
