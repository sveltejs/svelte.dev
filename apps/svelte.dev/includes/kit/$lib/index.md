This is a simple alias to `src/lib`, or whatever directory is specified as [`config.kit.files.lib`](/docs/kit/reference/configuration#files). It allows you to access common components and utility modules without `../../../../` nonsense.

### `$lib/server`

A subdirectory of `$lib`. SvelteKit will prevent you from importing any modules in `$lib/server` into client-side code. See [server-only modules](/docs/server-only-modules).
