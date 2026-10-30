# Playground: saving apps

Logged-in users can save, fork and list apps (`/apps`), with a GitHub account, an atproto account, or both. New apps and forks go to the default destination: the tab marked "default" on `/apps` (`save_to` cookie), else the first available below. Saving your own app updates it where it lives; saving someone else's copies it to the default.

| Destination                | Storage                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| Atmosphere public          | `dev.svelte.playground` record on the user's PDS                    |
| Atmosphere private (alpha) | same record, inside the space `dev.svelte.playground.private`       |
| GitHub                     | Supabase (`gist` table + `login`/`get_user`/`logout`/`gist_*` rpcs) |

Public atproto apps are readable by anyone at `/playground/<handle>/<rkey>` and listed at `/apps/<handle>`.

## atproto

- Tokens and every PDS call stay on the server (`src/lib/atproto/`, built on [airspace](https://getair.space)); the browser only talks to our API (`src/lib/apps.ts`).
- Server state is one key/value table (`store.ts`): OAuth state and sessions (per origin and DID), logins (`atsid` cookie) and profiles. Rows untouched for 60 days are swept on login.
- A PDS can't search or offset, so a listing walks at most 500 records (`MAX_RECORDS`, the count then reads `500+`).
- A dead OAuth session answers 401; the browser logs in again in a popup and retries once.
- OAuth refreshes are locked per process only: two instances refreshing the same DID at once can drop the session. A lock in `atproto_kv` fixes it if it shows up.

## Dev

Open `http://127.0.0.1:5173`: atproto OAuth forbids `localhost`, so dev redirects it.

Click "log in" in the playground: without GitHub credentials the popup explains how to register an OAuth app (callback `http://127.0.0.1:5173/auth/callback`) and what to put in `.env.local`. atproto needs no setup.

Without `SUPABASE_URL`/`SUPABASE_KEY`, sessions and apps are stored in `tmp/playground.json` (`src/lib/db/dev.js`) so save/fork/list work locally. Loading an id that isn't there proxies to svelte.dev, so existing playground links still open.

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

`dev.svelte.playground` (the app record) and `dev.svelte.playground.private` (the space holding private apps) are published on @svelte.dev (`did:plc:b6gbde64ngpelprsvnphc2l2`) and resolve through the `_lexicon.svelte.dev` and `_lexicon.playground.svelte.dev` TXT records. The `space:` scope is only granted once the space is published. To publish from the TypeScript model, with an app password of @svelte.dev:

```
AIRSPACE_APP_PASSWORD=... npx airspace lexicons publish --identity svelte.dev --lexicons src/lib/atproto/lexicons.ts
```

Spaces are an atproto alpha: private apps need a PDS running a spaces build, and `/accounts` shows whether it does.
