# sync-docs

Documentation lives in external repos (at the time of writing, [`sveltejs/svelte`](https://github.com/sveltejs/svelte), [`sveltejs/kit`](https://github.com/sveltejs/kit) and [`sveltejs/cli`](https://github.com/sveltejs/cli), though the plan is to add others) and synced into this repo.

The repos must be cloned (or linked — see [next section](#setup)) into the `apps/svelte.dev/repos` directory.

## Setup

For local development, it's recommended that you symlink the repos, so that you can see changes immediately then open a PR once you're happy with them:

```bash
cd apps/svelte.dev
ln -s /path/to/wherever/you/cloned/sveltejs/svelte repos/svelte
ln -s /path/to/wherever/you/cloned/sveltejs/kit repos/kit
ln -s /path/to/wherever/you/cloned/sveltejs/cli repos/cli
```

I have no idea what the equivalent Windows command would be.

## Syncing

To run the `sync-docs` script locally:

```bash
pnpm sync-docs
```

If you've symlinked the repos and want to watch for changes, you can use the `-w` command:

```bash
pnpm sync-docs -w # or --watch, if you're fancy
```

To pull from the remote first (or clone it, if you don't have it symlinked/cloned locally already):

```bash
pnpm sync-docs -p # or --pull
```

You can combine flags, and specify individual packages:

```bash
pnpm sync-docs -pw kit cli
```

## Automation

Changes to documentation in the source repos will trigger the [`sync-docs.yml`](../../../../.github/workflows/sync-docs.yml) workflow. This is possible because the repos in question have their own `sync-request.yml` workflow that dispatches a request to this repo.

To set up a new repo, create a file in that repo called `.github/workflows/sync-request.yml` with the following contents:

```yml
# https://github.com/sveltejs/svelte.dev/blob/main/apps/svelte.dev/scripts/sync-docs/README.md
name: Dispatch sync request

on:
  push:
    branches:
      - main

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.SYNC_REQUEST_TOKEN }}
          repository: sveltejs/svelte.dev
          event-type: sync-request
          client-payload: |-
            {
              "package": "<YOUR_PACKAGE_NAME>"
            }
```

`YOUR_PACKAGE_NAME` corresponds to the entry in [index.ts](./index.ts).

You will need to add a `SYNC_REQUEST_TOKEN` to the repo. First, create a personal access token by going to https://github.com/settings/personal-access-tokens/new:

- change the 'Resource owner' to `sveltejs`
- provide access to the `sveltejs/svelte.dev` repository
- under 'Repository permissions', change 'Contents' to 'Read and write'

Then, go to `https://github.com/<ORG>/<REPO>/settings/secrets/actions`, click 'New repository secret' and paste in your newly generated personal access token.
