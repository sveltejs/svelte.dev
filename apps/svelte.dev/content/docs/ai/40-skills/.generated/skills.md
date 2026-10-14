## `svelte-code-writer`

CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (.svelte) or Svelte module (.svelte.ts/.svelte.js). If possible, this skill should be executed within the svelte-file-editor agent for optimal results.

<a href="https://github.com/sveltejs/ai-tools/releases?q=svelte-code-writer" target="_blank" rel="noopener noreferrer">Open Releases page</a>

<details>
	<summary>View skill content</summary>

<!-- prettier-ignore-start -->
````markdown
---
name: svelte-code-writer
description: CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (.svelte) or Svelte module (.svelte.ts/.svelte.js). If possible, this skill should be executed within the svelte-file-editor agent for optimal results.
---

## CLI tools

You have access to `@sveltejs/mcp` CLI for Svelte-specific assistance. Use these commands via `npx`:

### List documentation sections

```bash
npx @sveltejs/mcp list-sections
```

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths.

### Get documentation

```bash
npx @sveltejs/mcp get-documentation "<section1>,<section2>,..."
```

Retrieves full documentation for specified sections. Use after `list-sections` to fetch relevant docs.

**Example:**

```bash
npx @sveltejs/mcp get-documentation "$state,$derived,$effect"
```

### Svelte autofixer

```bash
npx @sveltejs/mcp svelte-autofixer "<code_or_path>" [options]
```

Analyzes Svelte code and suggests fixes for common issues.

**Options:**

- `--async` - Enable async Svelte mode (default: false)
- `--svelte-version` - Target version: 4 or 5 (default: 5)

**Examples:**

```bash
# Analyze inline code (escape $ as \$)
npx @sveltejs/mcp svelte-autofixer '<script>let count = \$state(0);</script>'

# Analyze a file
npx @sveltejs/mcp svelte-autofixer ./src/lib/Component.svelte

# Target Svelte 4
npx @sveltejs/mcp svelte-autofixer ./Component.svelte --svelte-version 4
```

**Important:** When passing code with runes (`$state`, `$derived`, etc.) via the terminal, escape the `$` character as `\$` to prevent shell variable substitution.

## Workflow

1. **Uncertain about syntax?** Run `list-sections` then `get-documentation` for relevant topics
2. **Reviewing/debugging?** Run `svelte-autofixer` on the code to detect issues
3. **Always validate** - Run `svelte-autofixer` before finalizing any Svelte component
````
<!-- prettier-ignore-end -->

</details>

## `svelte-core-bestpractices`

Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte component or module. Covers reactivity, event handling, styling, integration with libraries and more.

<a href="https://github.com/sveltejs/ai-tools/releases?q=svelte-core-bestpractices" target="_blank" rel="noopener noreferrer">Open Releases page</a>

<details>
	<summary>View skill content</summary>

<!-- prettier-ignore-start -->
````markdown
---
name: svelte-core-bestpractices
description: Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte component or module. Covers reactivity, event handling, styling, integration with libraries and more.
---

## `$state`

Only use the `$state` rune for variables that should be _reactive_ — in other words, variables that cause an `$effect`, `$derived` or template expression to update. Everything else can be a normal variable.

Objects and arrays (`$state({...})` or `$state([...])`) are made deeply reactive, meaning mutation will trigger updates. This has a trade-off: in exchange for fine-grained reactivity, the objects must be proxied, which has performance overhead. In cases where you're dealing with large objects that are only ever reassigned (rather than mutated), use `$state.raw` instead. This is often the case with API responses, for example.

## `$derived`

To compute something from state, use `$derived` rather than `$effect`:

```js
// do this
let square = $derived(num * num);

// don't do this
let square;

$effect(() => {
	square = num * num;
});
```

> [!NOTE] `$derived` is given an expression, _not_ a function. If you need to use a function (because the expression is complex, for example) use `$derived.by`.

Deriveds are writable — you can assign to them, just like `$state`, except that they will re-evaluate when their expression changes.

If the derived expression is an object or array, it will be returned as-is — it is _not_ made deeply reactive. You can, however, use `$state` inside `$derived.by` in the rare cases that you need this.

## `$effect`

Effects are an escape hatch and should mostly be avoided. In particular, avoid updating state inside effects.

- If you need to sync state to an external library such as D3, it is often neater to use [`{@attach ...}`](references/attach.md)
- If you need to run some code in response to user interaction, put the code directly in an event handler or use a [function binding](references/bind.md) as appropriate
- If you need to log values for debugging purposes, use [`$inspect`](references/inspect.md)
- If you need to observe something external to Svelte, use [`createSubscriber`](references/svelte-reactivity.md)

Never wrap the contents of an effect in `if (browser) {...}` or similar — effects do not run on the server.

## `$props`

Treat props as though they will change. For example, values that depend on props should usually use `$derived`:

```js
// @errors: 2451
let { type } = $props();

// do this
let color = $derived(type === 'danger' ? 'red' : 'green');

// don't do this — `color` will not update if `type` changes
let color = type === 'danger' ? 'red' : 'green';
```

## `$inspect.trace`

`$inspect.trace` is a debugging tool for reactivity. If something is not updating properly or running more than it should you can add `$inspect.trace(label)` as the first line of an `$effect` or `$derived.by` (or any function they call) to trace their dependencies and discover which one triggered an update.

## Events

Any element attribute starting with `on` is treated as an event listener:

```svelte
<button onclick={() => {...}}>click me</button>

<!-- attribute shorthand also works -->
<button {onclick}>...</button>

<!-- so do spread attributes -->
<button {...props}>...</button>
```

If you need to attach listeners to `window` or `document` you can use `<svelte:window>` and `<svelte:document>`:

```svelte
<svelte:window onkeydown={...} />
<svelte:document onvisibilitychange={...} />
```

Avoid using `onMount` or `$effect` for this.

## Snippets

[Snippets](references/snippet.md) are a way to define reusable chunks of markup that can be instantiated with the [`{@render ...}`](references/render.md) tag, or passed to components as props. They must be declared within the template.

```svelte
{#snippet greeting(name)}
	<p>hello {name}!</p>
{/snippet}

{@render greeting('world')}
```

> [!NOTE] Snippets declared at the top level of a component (i.e. not inside elements or blocks) can be referenced inside `<script>`. A snippet that doesn't reference component state is also available in a `<script module>`, in which case it can be exported for use by other components.

## Each blocks

Prefer to use [keyed each blocks](references/each.md) — this improves performance by allowing Svelte to surgically insert or remove items rather than updating the DOM belonging to existing items.

> [!NOTE] The key _must_ uniquely identify the object. Do not use the index as a key.

Avoid destructuring if you need to mutate the item (with something like `bind:value={item.count}`, for example).

## Using JavaScript variables in CSS

If you have a JS variable that you want to use inside CSS you can set a CSS custom property with the `style:` directive.

```svelte
<div style:--columns={columns}>...</div>
```

You can then reference `var(--columns)` inside the component's `<style>`.

## Styling child components

The CSS in a component's `<style>` is scoped to that component. If a parent component needs to control the child's styles, the preferred way is to use CSS custom properties:

```svelte
<!-- Parent.svelte -->
<Child --color="red" />

<!-- Child.svelte -->
<h1>Hello</h1>

<style>
	h1 {
		color: var(--color);
	}
</style>
```

If this is impossible (for example, the child component comes from a library) you can use `:global` to override styles:

```svelte
<div>
	<Child />
</div>

<style>
	div :global {
		h1 {
			color: red;
		}
	}
</style>
```

## Context

Consider using context instead of declaring state in a shared module. This will scope the state to the part of the app that needs it, and eliminate the possibility of it leaking between users when server-side rendering.

Use `createContext` rather than `setContext` and `getContext`, as it provides type safety.

## Async Svelte

If using version 5.36 or higher, you can use [await expressions](references/await-expressions.md) and [hydratable](references/hydratable.md) to use promises directly inside components. Note that these require the `experimental.async` option to be enabled in `svelte.config.js` as they are not yet considered fully stable.

## Avoid legacy features

Always use runes mode for new code, and avoid features that have more modern replacements:

- use `$state` instead of implicit reactivity (e.g. `let count = 0; count += 1`)
- use `$derived` and `$effect` instead of `$:` assignments and statements (but only use effects when there is no better solution)
- use `$props` instead of `export let`, `$$props` and `$$restProps`
- use `onclick={...}` instead of `on:click={...}`
- use `{#snippet ...}` and `{@render ...}` instead of `<slot>` and `$$slots` and `<svelte:fragment>`
- use `<DynamicComponent>` instead of `<svelte:component this={DynamicComponent}>`
- use `import Self from './ThisComponent.svelte'` and `<Self>` instead of `<svelte:self>`
- use classes with `$state` fields to share reactivity between components, instead of using stores
- use `{@attach ...}` instead of `use:action`
- use clsx-style arrays and objects in `class` attributes, instead of the `class:` directive
````
<!-- prettier-ignore-end -->

</details>

## `svelte-mcp-feedback`

Report Svelte MCP autofixer opportunities when the user corrects a Svelte or SvelteKit mistake the agent made while working on a file. Use after corrections to .svelte components, .svelte.ts/.svelte.js modules, or SvelteKit routes, load functions, actions, hooks, and configuration, when a reusable check or fix could prevent the mistake. Do not trigger for initial implementation requests, unrelated bugs, or purely personal style preferences.

<a href="https://github.com/sveltejs/ai-tools/releases?q=svelte-mcp-feedback" target="_blank" rel="noopener noreferrer">Open Releases page</a>

<details>
	<summary>View skill content</summary>

<!-- prettier-ignore-start -->
````markdown
---
name: svelte-mcp-feedback
description: Report Svelte MCP autofixer opportunities when the user corrects a Svelte or SvelteKit mistake the agent made while working on a file. Use after corrections to .svelte components, .svelte.ts/.svelte.js modules, or SvelteKit routes, load functions, actions, hooks, and configuration, when a reusable check or fix could prevent the mistake. Do not trigger for initial implementation requests, unrelated bugs, or purely personal style preferences.
---

# Svelte MCP feedback

Turn a user-corrected mistake into actionable feedback for the Svelte MCP autofixer in `sveltejs/ai-tools`.

## 1. Identify the autofixer opportunity

Use the conversation and the code you just worked on to identify:

- The incorrect code you produced and the user's correction.
- The Svelte or SvelteKit rule that explains the correction.
- A reusable code pattern the MCP could detect, and the fix or suggestion it could provide.

Include SvelteKit JavaScript/TypeScript files such as `+page.ts`, `+layout.server.ts`, `+server.ts`, `hooks.server.ts`, and `svelte.config.js`; feedback is not limited to `.svelte` files.

Only proceed if there is a concrete, generalizable Svelte/SvelteKit mistake. A changed product requirement, a personal naming preference, or an unrelated application bug does not justify an autofixer issue. If the correction is ambiguous, clarify it while continuing the user's task.

Apply the user's correction and complete the requested work. Reporting feedback should not leave the original mistake unfixed.

## 2. Capture a minimal reproduction

Reduce the before/after code to the smallest example that preserves the mistake. Use generic names and sample data instead of copying unrelated project code, credentials, or conversation history.

If the Svelte MCP is available, check its relevant documentation and run `svelte-autofixer` on the incorrect example when it supports that file type. Record whether it missed the issue, suggested an incorrect fix, or already reported the issue and you overlooked it. Do not claim the tool missed something without checking its output. If the tool is unavailable or does not support the file type, say so; a proposed new rule can still be useful.

If an existing diagnostic already clearly covers the correction, follow it instead of opening a new-rule request. Report only a concrete gap, such as an unclear diagnostic, a wrong suggested fix, or a missed case.

Prepare a title like `Autofixer: detect <incorrect pattern>` and a Markdown body with:

1. **Summary** — the mistake and why it matters.
2. **Incorrect code** — a fenced minimal example with the relevant filename/file type.
3. **User correction / expected code** — the corrected example and a brief explanation.
4. **Proposed detection and fix** — the recognizable pattern, suggested transformation or guidance, and cases where a fix would be ambiguous.
5. **Current MCP behavior** — the actual relevant output, or explicitly "not checked" with the reason.
6. **Environment** — Svelte, SvelteKit, MCP, and model versions when known; do not invent missing versions.

The report is ready when a maintainer can understand the pattern and expected outcome without access to the original project.

## 3. Open the issue

Use GitHub CLI when it is installed and authenticated. Check with `gh --version` and `gh auth status`. Always specify `--repo sveltejs/ai-tools` so the issue does not go to the user's project repository.

Search for an existing report of the same pattern:

```sh
gh issue list --repo sveltejs/ai-tools --state all --search '<pattern keywords>' --limit 20
```

Read likely matches with `gh issue view <number> --repo sveltejs/ai-tools`. If an issue already describes the same reproduction and expected fix, share its link instead of filing a duplicate. If a closed issue was supposedly fixed but your example still fails, describe that regression and link the old issue in the new report.

Write the issue body to a temporary Markdown file using a file-writing tool or a quoted heredoc. Pass the title as a safely quoted argument and use `--body-file` so code snippets and backticks are not interpreted by the shell:

```sh
gh issue create --repo sveltejs/ai-tools --title 'Autofixer: detect <incorrect pattern>' --body-file '<temporary-body-file>'
```

Capture and share the returned issue URL. Do not guess labels or assignees. If creation fails, report the failure and use the browser fallback. If the result is uncertain (for example, a network timeout after submission), check for the issue before retrying.

### Browser fallback

If `gh` is unavailable, unauthenticated, or unable to create the issue, build a URL for:

```text
https://github.com/sveltejs/ai-tools/issues/new?title=<encoded-title>&body=<encoded-body>
```

Encode each query value with `encodeURIComponent`, `URLSearchParams`, or an equivalent URL encoder; do not interpolate raw Markdown into the URL. Open it using an available browser tool or the platform URL opener (`open` on macOS, `xdg-open` on Linux, or `Start-Process` in PowerShell). This opens the new-issue form with the draft filled in for the user to submit.

If the full report makes the URL too long, prefill the title and a short summary, and provide the full Markdown body for the user to paste. If no browser can be opened, provide the clickable prefilled URL and the body in the response.

Distinguish the outcome: either give the URL of the created/existing issue, or say that the draft form is ready and the user still needs to submit it. Then return to the user's original task.
````
<!-- prettier-ignore-end -->

</details>
