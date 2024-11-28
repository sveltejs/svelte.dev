---
title: <svelte:boundary>
---

Some areas of your app might be susceptible to errors. To prevent such errors from putting your app in a broken state, you can guard parts of your code with so-called error boundaries, using `<svelte:boundary>`.

The given example contains a component that breaks after clicking its button, without a visual indicator that it crashed nor a way to recover from it.

Let's change that by wrapping `<FlakyComponent />` with `<svelte:boundary>`:

```svelte
<!--- file: App.svelte --->
+++<svelte:boundary>+++
	<FlakyComponent />
+++</svelte:boundary>+++
```

Now, when the Component errors, the error is contained within the boundary.

While the rest of the app is now safe from any unwanted side effects of the error, it would be good to show the user that something went wrong. For that, we add the `failed` snippet to the boundary:

```svelte
<!--- file: App.svelte --->
<svelte:boundary>
	<FlakyComponent />
	+++{#snippet failed(error)}
		<p>Component crashed: {error.message}</p>
	{/snippet}+++
</svelte:boundary>
```

We can even reset the inner content to try again, by making use of the second argument passed to `failed`:

```svelte
<!--- file: App.svelte --->
<svelte:boundary>
	<FlakyComponent />
	{#snippet failed(error+++, reset+++)}
		<p>Component crashed: {error.message}</p>
		+++<button onclick={reset}>Reset</button>+++
	{/snippet}
</svelte:boundary>
```

Lastly, we "record" the error to our system by listening to the `error` event and `console.log`ging it:

```svelte
<!--- file: App.svelte --->
<svelte:boundary +++onerror={error => console.log(error)}+++>
	<FlakyComponent />
	{#snippet failed(error, reset)}
		<p>Component crashed: {error.message}</p>
		<button onclick={reset}>Reset</button>
	{/snippet}
</svelte:boundary>
```
