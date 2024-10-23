# svelte.dev

This is the repository behind [svelte.dev](https://svelte.dev), the official Svelte site, and the related packages that it relies on.

## Documentation PRs

If you're creating a documentation PR, make sure you're targeting the right repository. More specifically, changes to content within `apps/svelte.dev/content/docs` are synced from other repositories, and documentation changes within those folder should therefore be made in those repositories:

- `docs/svelte` -> https://github.com/sveltejs/svelte
- `docs/kit` -> https://github.com/sveltejs/kit
- `docs/cli` -> https://github.com/sveltejs/cli

The tutorial, blog and examples are maintained within this repository.

## Setup

```
pnpm install
cd apps/svelte.dev
USE_GIT=true pnpm sync-docs
pnpm run dev
```
