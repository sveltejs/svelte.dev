# sync-packages

This script syncs the packages metadata from NPM & GitHub.

## Usage

```bash
pnpm sync-packages
```

## Notes

- All packages `names` are in `FEATURED` of [packages-meta.ts](apps/svelte.dev/src/lib/packages-meta.ts) file.

If you want to add or remove a package, you need to update `FEATURED` objects and run the script again (it will update the json files in the `src/lib/server/generated/registry` directory).

- [sync-packages.yml](/.github/workflows/sync-packages.yml) is responsible for running the script regularly and update all metadata (it can also be triggered manually).

- Ambassadors and maintainers are curating the list of packages.
