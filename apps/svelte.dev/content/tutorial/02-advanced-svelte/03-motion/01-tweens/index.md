---
title: Tweened values
---

Often, a good way to communicate that a value is changing is to use _motion_. Svelte ships classes for adding motion to your user interfaces.

Import the `Tween` class from `svelte/motion`:

```svelte
/// file: App.svelte
<script>
	+++import { Tween } from 'svelte/motion';+++

	let progress = $state(0);
</script>
```

Turn `progress` into an instance of `Tween`:

```svelte
/// file: App.svelte
<script>
	import { Tween } from 'svelte/motion';

	let progress = +++new Tween+++(0);
</script>
```

The `Tween` class has a writable `target` property and a readonly `current` property — update the `<progress>` element...

```svelte
<progress value={progress.+++current+++}></progress>
```

...and each of the event handlers:

```svelte
<button onclick={() => (progress.+++target+++ = 0)}>
	0%
</button>
```

Clicking the buttons causes the progress bar to animate to its new value. It's a bit robotic and unsatisfying though. We need to add an easing function:

```svelte
/// file: App.svelte
<script>
	import { Tween } from 'svelte/motion';
	+++import { cubicOut } from 'svelte/easing';+++

	let progress = new Tween(0, +++{
		duration: 400,
		easing: cubicOut
	}+++);
</script>
```

> [!NOTE] The `svelte/easing` module contains the [Penner easing equations](https://web.archive.org/web/20190805215728/http://robertpenner.com/easing/), or you can supply your own `p => t` function where `p` and `t` are both values between 0 and 1.

The full set of options available to `Tween`:

- `delay` — milliseconds before the tween starts
- `duration` — either the duration of the tween in milliseconds, or a `(from, to) => milliseconds` function allowing you to (e.g.) specify longer tweens for larger changes in value
- `easing` — a `p => t` function
- `interpolate` — a custom `(from, to) => t => value` function for interpolating between arbitrary values. By default, Svelte will interpolate between numbers, dates, and identically-shaped arrays and objects (as long as they only contain numbers and dates or other valid arrays and objects). If you want to interpolate (for example) colour strings or transformation matrices, supply a custom interpolator

You can also call `progress.set(value, options)` instead of assigning directly to `progress.target`, in which case `options` will override the defaults. The `set` method returns a promise that resolves when the tween completes.
