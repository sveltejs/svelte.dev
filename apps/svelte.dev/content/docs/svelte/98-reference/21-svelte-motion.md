---
title: svelte/motion
---



```js
// @noErrors
import { spring, tweened } from 'svelte/motion';
```

## spring

The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.

<div class="ts-block">

```ts
// @noErrors
function spring<T = any>(
	value?: T | undefined,
	opts?: SpringOpts | undefined
): Spring<T>;
```

</div>

## tweened

A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.

<div class="ts-block">

```ts
// @noErrors
function tweened<T>(
	value?: T | undefined,
	defaults?: TweenedOptions<T> | undefined
): Tweened<T>;
```

</div>

## Spring

<div class="ts-block">

```dts
interface Spring<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set: (new_value: T, opts?: SpringUpdateOpts) => Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
precision: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
damping: number;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
stiffness: number;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## Tweened

<div class="ts-block">

```dts
interface Tweened<T> extends Readable<T> {/*…*/}
```

<div class="ts-block-property">

```dts
set(value: T, opts?: TweenedOptions<T>): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
update(updater: Updater<T>, opts?: TweenedOptions<T>): Promise<void>;
```

<div class="ts-block-property-details"></div>
</div>
</div>


