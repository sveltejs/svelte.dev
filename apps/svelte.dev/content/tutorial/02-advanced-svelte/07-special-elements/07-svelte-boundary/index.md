---
title: <svelte:boundary>
---

To prevent errors from leaving your app in a broken state, you can contain them inside an _error boundary_ using the `<svelte:boundary>` element.

In this example, `<FlakyComponent>` contains a bug — clicking the button will set `mouse` to `null`, meaning that the `{mouse.x}` and `{mouse.y}` expressions in the template will fail to render.

In an ideal world we'd simply fix the bug. But that's not always an option — sometimes the component belongs to someone else, and sometimes you just need to guard against the unexpected. Begin by wrapping `<FlakyComponent />` with `<svelte:boundary>`:

```svelte
<!--- file: App.svelte --->
+++<svelte:boundary>+++
	<FlakyComponent />
+++</svelte:boundary>+++
```

So far, nothing has changed, because the boundary doesn't specify a handler. Add a `failed` [snippet](snippets-and-render-tags) to provide some UI to show when an error occurs:

```svelte
<!--- file: App.svelte --->
<svelte:boundary>
	<FlakyComponent />

+++	{#snippet failed(error)}
		<p>Oops! {error.message}</p>
	{/snippet}+++
</svelte:boundary>
```

Now, when we click the button, the contents of the boundary are replaced with the snippet. We can attempt to reset things by making use of the second argument passed to `failed`:

```svelte
<!--- file: App.svelte --->
<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error+++, reset+++)}
		<p>Oops! {error.message}</p>
		+++<button onclick={reset}>Reset</button>+++
	{/snippet}
</svelte:boundary>
```

We can also specify an `onerror` handler, which is called with the same arguments passed to the `failed` snippet:

```svelte
<!--- file: App.svelte --->
<svelte:boundary +++onerror={(e) => console.error(e)}+++>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<p>Oops! {error.message}</p>
		<button onclick={reset}>Reset</button>
	{/snippet}
</svelte:boundary>
```

This is useful for sending information about the error to a reporting service, or adding UI outside the error boundary itself.
