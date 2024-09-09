---
title: svelte/reactivity
---

## SvelteDate

<div class="ts-block">

```dts
class SvelteDate extends Date {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(...params: any[]);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
#private;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SvelteMap

<div class="ts-block">

```dts
class SvelteMap<K, V> extends Map<K, V> {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(value?: Iterable<readonly [K, V]> | null | undefined);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
set(key: K, value: V): this;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
#private;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SvelteSet

<div class="ts-block">

```dts
class SvelteSet<T> extends Set<T> {/*…*/}
```

<div class="ts-block-property">

```dts
constructor(value?: Iterable<T> | null | undefined);
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
add(value: T): this;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
#private;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SvelteURL

<div class="ts-block">

```dts
class SvelteURL extends URL {/*…*/}
```

<div class="ts-block-property">

```dts
get searchParams(): SvelteURLSearchParams;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
#private;
```

<div class="ts-block-property-details"></div>
</div>
</div>

## SvelteURLSearchParams

<div class="ts-block">

```dts
class SvelteURLSearchParams extends URLSearchParams {/*…*/}
```

<div class="ts-block-property">

```dts
[REPLACE](params: URLSearchParams): void;
```

<div class="ts-block-property-details"></div>
</div>

<div class="ts-block-property">

```dts
#private;
```

<div class="ts-block-property-details"></div>
</div>
</div>


