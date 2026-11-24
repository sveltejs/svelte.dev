# Playground: saving apps

Logged-in users can save, fork and list apps (`/apps`). Auth is GitHub OAuth; apps and sessions live in Supabase (`gist` table + `login`/`get_user`/`logout`/`gist_*` rpcs).

## Dev

Click "log in" in the playground: without GitHub credentials the popup explains how to register an OAuth app and what to put in `.env.local`.

Without `SUPABASE_URL`/`SUPABASE_KEY`, sessions and apps are stored in `tmp/playground.json` (`src/lib/db/dev.js`) so save/fork/list work locally. Loading an id that isn't there proxies to svelte.dev, so existing playground links still open.

## Prod

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SUPABASE_URL=...
SUPABASE_KEY=...
```
