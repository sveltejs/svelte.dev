---
title: Effects
---

So far we've talked about reactivity in terms of state. But that's only half of the equation — state is only reactive if something is _reacting_ to it, otherwise it's just a sparkling variable.

The thing that reacts is called an _effect_. You've already encountered effects — the ones that Svelte creates on your behalf to update the DOM in response to state changes — but you can also create your own with the `$effect` rune.

> [!NOTE] Most of the time, you shouldn't. `$effect` is best thought of as an escape hatch, rather than something to use frequently. If you can put your side effects in an [event handler](dom-events), for example, that's almost always preferable.

Let's say we want to use `setInterval` to keep track of how long the component has been mounted. Create the effect:

```svelte
/// file: App.svelte
<script>
	let elapsed = $state(0);
	let interval = $state(1000);

+++	$effect(() => {
		setInterval(() => {
			elapsed += 1;
		}, interval);
	});+++
</script>
```

Click the 'speed up' button a few times. Notice that `elapsed` ticks up faster each time because we're creating new intervals without stopping the old ones.

If you then click 'slow down', something strange happens: `elapsed` starts incrementing even faster! This occurs because each button click creates an additional interval timer without cleaning up previous ones. Soon you'll have multiple timers running simultaneously.

The real issue isn't that "slow down doesn't work" — it's that we're accumulating intervals without cleanup. We can fix this by returning a cleanup function:

```js
/// file: App.svelte
$effect(() => {
	+++const id =+++ setInterval(() => {
		elapsed += 1;
	}, interval);

+++	return () => {
		clearInterval(id);
	};+++
});
```

The cleanup function is called immediately before the effect function re-runs when `interval` changes, and also when the component is destroyed.

If the effect function doesn't read any state when it runs, it will only run once, when the component mounts.

> [!NOTE] Effects do not run during server-side rendering.
