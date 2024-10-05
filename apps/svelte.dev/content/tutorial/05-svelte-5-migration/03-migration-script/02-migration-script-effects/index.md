---
title: Migrating run
---

First look `run` from `svelte/legacy`: `$:` statements ran on the server and the client. `$effect` only runs on the client. When the migration detects that it cannot express a certain reactive statement as a `$derived`, it therefore uses `run` instead, which behaves like "run once on the server, run like `$effect` on the client". The task is to either migrate it towards a `$derived` (prefered, if possible), or towards `$effect` if you determine that it's ok (or actually desireable) that the given code does not run on the server

TODO
