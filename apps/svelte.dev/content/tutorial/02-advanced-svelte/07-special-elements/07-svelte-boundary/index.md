---
title: <svelte:boundary>
---

Some areas of your app might be susceptible to errors. To prevent such errors from crashing your app entirely, you can guard parts of your code with so-called error boundaries, using `<svelte:boundary>`.

The given example contains a boring counter, which will never fail, and a dangerous button, which throws an error 50% of the time. Right now, if such an error is thrown, the app as a whole crashes, without a way to recover.

Let's change that by wrapping `<FlakyCounter />` with `<svelte:boundary>`:

```svelte
<!--- file: App.svelte --->
+++<svelte:boundary>+++
	<FlakyCounter />
+++</svelte:boundary>+++
```

Now, when the counter errors, the boring counter continues to work — the error is contained within the boundary.

While the rest of the app is still functional, it would be good to show the user that something went wrong. For that, we add the `failed` snippet to the boundary:

```svelte
<!--- file: App.svelte --->
<svelte:boundary>
	<FlakyCounter />
	+++{#snippet failed(error)}
		<p>{error.message}</p>
	{/snippet}+++
</svelte:boundary>
```

We can even reset the inner content to try again, by making use of the second argument passed to `failed`:

```svelte
<!--- file: App.svelte --->
<svelte:boundary>
	<FlakyCounter />
	{#snippet failed(error+++, reset+++)}
		<p>{error.message}</p>
		+++<button onclick={reset}>Try again</button>+++
	{/snippet}
</svelte:boundary>
```

Lastly, we "record" the error to our system by listening to the `error` event and `console.log`ging it:

```svelte
<!--- file: App.svelte --->
<svelte:boundary +++onerror={error => console.log(error)}+++>
	<FlakyCounter />
	{#snippet failed(error, reset)}
		<p>{error.message}</p>
		<button onclick={reset}>Try again</button>
	{/snippet}
</svelte:boundary>
```
