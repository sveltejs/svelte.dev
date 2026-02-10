## `svelte-code-writer`

CLI tools for Svelte 5 documentation lookup and code analysis. MUST be used whenever creating, editing or analyzing any Svelte component (.svelte) or Svelte module (.svelte.ts/.svelte.js). If possible, this skill should be executed within the svelte-file-editor agent for optimal results.

<a href="https://github.com/sveltejs/mcp/releases?q=svelte-code-writer" target="_blank" rel="noopener noreferrer">Open Releases page</a>

<details>
	<summary>View skill content</summary>

<!-- prettier-ignore-start -->
````markdown
# Svelte 5 Code Writer

## CLI Tools

You have access to `@sveltejs/mcp` CLI for Svelte-specific assistance. Use these commands via `npx`:

### List Documentation Sections

```bash
npx @sveltejs/mcp list-sections
```

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths.

### Get Documentation

```bash
npx @sveltejs/mcp get-documentation "<section1>,<section2>,..."
```

Retrieves full documentation for specified sections. Use after `list-sections` to fetch relevant docs.

**Example:**

```bash
npx @sveltejs/mcp get-documentation "$state,$derived,$effect"
```

### Svelte Autofixer

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

Learn how to write very good svelte code...load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte component or module that uses client side reactivity.

<a href="https://github.com/sveltejs/mcp/releases?q=svelte-core-bestpractices" target="_blank" rel="noopener noreferrer">Open Releases page</a>

<details>
	<summary>View skill content</summary>

<!-- prettier-ignore-start -->
````markdown
## State and Deriveds

When writing As Svelte component, each variable that needs to be used inside an effect a derived or in the template must be declared with `$state`. Objects and arrays are automatically deeply reactive, and you can just mutate properties or push to them to trigger reactivity. If you are not mutating or pushing, consider using `$state.raw` to improve performance. Not every variable must be stateful, if a variable is only used to store information and never in an `$effect`, `$derived` or in the template you can avoid using `$state` completely.

If one stateful variable depends on another stateful variable, you must use `$derived` to create this new piece of state. `$derived` accepts an expression as input. If you want to use a function, you must use `$derived.by`. Only the stateful variables that are read within a derived actually count as a dependency of that derived. This means that if you guard the read of a stateful variable with an `if`, that stateful variable will only be a dependency when the condition is true. The value of a derived can be overridden; When overridden, the value will change immediately and trigger a DOM update. But when one of the dependencies changes, the value will be recalculated and the DOM updated once again. If a component is receiving a prop and you want a piece of state to be initialised from that prop, usually it's a good idea to use a derived because if that prop is a stateful variable, when it changes, Svelte will just update the value, not remount the component; If the value could be an object, a class, or an array, the suggestion is to use `$state.snapshot` to clone them (`$state.snapshot` is using `structuredClone` under the hood so it might not always be a good idea).

## The `$effect` rune

`$effect` is generally considered a malpractice in Svelte. You should almost never use `$effect` to sync between stateful variables (use a `$derived` for that) and reassigning state within an `$effect` is especially bad. When encountering an `$effect` asks yourself if that's really needed. It can usually be substituted by:

- A `$derived`
- An `@attach`
- A class that uses `createSubscriber`

The valid use cases for `$effect` are mainly to sync svelte reactivity with a non-reactive system (like a D3 class or the local storage or inside an attachment to do imperative DOM operations).

Like `$derived`, `$effect` automatically has every stateful variable (declared with `$state` or `$derived`) as a dependency when it's read (if you guard the read of a stateful variable with an `if`, that stateful variable will only be a dependency when the condition is true)

If you want to log a value whenever the reactive variable changes use `$inspect` instead.

For more information on when not to use `$effect` read [this file](references/when-not-to-use-effect.md).

`$effect` only runs on the client so you don't need to guard with `browser` or `typeof window === "undefined"`

## `$bindable`

You can use `$bindable` inside `MyComponent.svelte` like this

```svelte
<script>
	let { value = $bindable() } = $props();
</script>
```

to allow `<MyComponent bind:value />`. This can get hairy when the value of the prop is not a literal value; try to use callbacks in that case.

```svelte
<script>
	let { value, onchange } = $props();
</script>
```

## `$inspect.trace`

`$inspect.trace` is a debugging tool for reactivity. If something is not updating properly or running more than it should you can put `$inspect.trace("[yourlabel]")` as the first line of an `$effect` or `$derived.by` to get detailed logs about the dependencies of it.

## Events on elements

Every prop that starts with `on` is treated as an event listener for the element. To register a `click` listener on an element you can do `<button onclick={()=>{}} />` (NOTE: in svelte 5 there's no colon between `on` and `click`). Since elements are just attributes you can spread them, use the `{onclick}` shorthand etc.

If you need to attach listeners to `window` or `document` use `<svelte:window onclick>` or `<svelte:window onclick>` instead of using `onMount`/`$effect`

## Each blocks

When using an each block to iterate over some value prefer using the item without destructuring it in case you want to bind that value to an attribute. Prefer using a keyed each block if possible, this will improve performance because svelte will just compare the keys to know if it needs to update the dom of that specific element.

```svelte
{#each items as item (item.id)}
	<li>{item.name} x {item.qty}</li>
{/each}
```

The key MUST actually uniquely identify the object DO NOT use the index.

## Snippet

You can think of snippets like functions that render markup when invoked with the `{@render}` tag. You can declare snippets in the template part of a Svelte component and they will be available as a variable in the `script` tag. If they don't contain any state created in the `script` tag they will also be available in the `script module`.

Every snippet created as a child of a component will be automatically passed as a prop to that component

```svelte
<MyComponent>
	<!--This will be passed as a `test` prop-->
	{#snippet test()}{/snippet}
</MyComponent>
```

## Attachments

Read [this file](references/attachments.md) if you need to use imperative DOM api.

## Use dynamic variables in css

If you have a JS variable that you want to use inside CSS you can do so by using the `style:` directive.

```svelte
<div style:--columns={columns}></div>
```

this will add a style attribute with the `--columns:` variable that you can use in your `<style>` tag.

## Dynamic classes

Since `svelte@5.16.0` you can use `clsx` style directly in the `class` attribute of an element

```svelte
<script>
	let { cool } = $props();
</script>

<!-- results in `class="cool"` if `cool` is truthy,
	 `class="lame"` otherwise -->
<div class={{ cool, lame: !cool }}>...</div>

<!-- if `faded` and `large` are both truthy, results in
	 `class="saturate-0 opacity-50 scale-200"` -->
<div class={[faded && 'saturate-0 opacity-50', large && 'scale-200']}>...</div>
```

Arrays can contain arrays and objects, and clsx will flatten them.

## Await expressions

If you are using `svelte@5.36` or higher you can read everything about await expressions in [this file](references/await-expressions.md) to learn how to use `await` in your component and [this file](references/hydratable.md) to learn how to properly hydrate them.

## Styling Child components

Read [this file](references/style-child.md) to learn more about styling child components in svelte

## Stores

In Svelte 4 stores where THE way to allow interactivity outside of a `.svelte` file. In Svelte 5 that changed and you can now use a `.svelte.{ts|js}` file with universal reactivity.

When possible prefer to use universal reactivity instead of creating a store. Some projects might have stores already in use consider that when writing a new utility.

## Context

Context is useful to have some state scoped to a component tree. If you have a situation where you need to have some "global" state consider using context and read [this file](references/context.md)
````
<!-- prettier-ignore-end -->

</details>
