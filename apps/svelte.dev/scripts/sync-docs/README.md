# sync-docs

Documentation lives in external repos (at the time of writing, [`sveltejs/svelte`](https://github.com/sveltejs/svelte), [`sveltejs/kit`](https://github.com/sveltejs/kit), [`sveltejs/cli`](https://github.com/sveltejs/cli) and [`sveltejs/mcp`](https://github.com/sveltejs/mcp), though the plan is to add others) and synced into this repo.

The repos must be cloned (or linked — see [next section](#setup)) into the `apps/svelte.dev/repos` directory.

## Setup

For local development, it's recommended that you symlink the repos, so that you can see changes immediately then open a PR once you're happy with them:

```bash
cd apps/svelte.dev
ln -s /path/to/wherever/you/cloned/sveltejs/svelte repos/svelte
ln -s /path/to/wherever/you/cloned/sveltejs/kit repos/kit
ln -s /path/to/wherever/you/cloned/sveltejs/cli repos/cli
```

For windows powershell (requires administrator privileges):

```bash
cd apps/svelte.dev
New-Item -Path .\repos\svelte -ItemType SymbolicLink -Value /path/to/wherever/you/cloned/sveltejs/svelte
New-Item -Path .\repos\kit -ItemType SymbolicLink -Value /path/to/wherever/you/cloned/sveltejs/kit
New-Item -Path .\repos\cli -ItemType SymbolicLink -Value /path/to/wherever/you/cloned/sveltejs/cli
```

The path needs to be absolute to work properly.

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

## Previews

Preview deployments will be created for pull requests to external repos that result in documentation changes. In the external repo, add a `.github/workflows/docs-preview-create-request.yml` workflow...

```yml
# https://github.com/sveltejs/svelte.dev/blob/main/apps/svelte.dev/scripts/sync-docs/README.md
name: Docs preview create request

on:
  pull_request_target:
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
          event-type: docs-preview-create
          client-payload: |-
            {
              "package": "<YOUR_PACKAGE_NAME>",
              "repo": "${{ github.repository }}",
              "owner": "${{ github.event.pull_request.head.repo.owner.login }}",
              "branch": "${{ github.event.pull_request.head.ref }}",
              "pr": ${{ github.event.pull_request.number }}
            }
```

...and a `.github/workflows/docs-preview-delete-request.yml` workflow:

```yml
# https://github.com/sveltejs/svelte.dev/blob/main/apps/svelte.dev/scripts/sync-docs/README.md
name: Docs preview delete request

on:
  pull_request_target:
    branches:
      - main
    types: [closed]

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.SYNC_REQUEST_TOKEN }}
          repository: sveltejs/svelte.dev
          event-type: docs-preview-delete
          client-payload: |-
            {
              "package": "cli",
              "repo": "${{ github.repository }}",
              "owner": "${{ github.event.pull_request.head.repo.owner.login }}",
              "branch": "${{ github.event.pull_request.head.ref }}",
              "pr": ${{ github.event.pull_request.number }}
            }
```

These use the same `SYNC_REQUEST_TOKEN` as above.

Inside _this_ repo, the [`docs-preview-create.yml`](../../../../.github/workflows/docs-preview-create.yml) workflow creates a comment on the PR once the branch has been created, inferring the eventual Vercel preview deployment URL. It uses this repo's `COMMENTER_TOKEN` secret, which is a [personal access token](https://github.com/settings/personal-access-tokens/new) with write permissions on issues and pull requests.
