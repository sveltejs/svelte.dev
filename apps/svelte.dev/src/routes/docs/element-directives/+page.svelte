<script>
	import RemovedPage from '../RemovedPage.svelte';

	const docs = new Map([
		['on-eventname ', ['`on:eventname`', '/docs/svelte/basic-markup#Events']],
		['bind-property', ['`bind:property`', '/docs/svelte/bind']],
		['binding-select-value ', ['Binding `<select>` value', '/docs/svelte/bind#select-bind:value']],
		['media-element-bindings ', ['Media element bindings', '/docs/svelte/bind#audio']],
		['image-element-bindings ', ['Image element bindings', '/docs/svelte/bind#img']],
		[
			'block-level-element-bindings ',
			['Block-level element bindings', '/docs/svelte/bind#Dimensions']
		],
		['bind-group ', ['`bind:group`', '/docs/svelte/bind#input-bind:group']],
		['bind-this ', ['`bind:this`', '/docs/svelte/bind#bind:this']],
		['class-name ', ['`class:name`', '/docs/svelte/class']],
		['style-property ', ['`style:property`', '/docs/svelte/style']],
		['use-action', ['`use:action`', '/docs/svelte/use']],
		['transition-fn ', ['`transition:fn`', '/docs/svelte/transition']],
		[
			'transition-parameters ',
			['Transition parameters', '/docs/svelte/transition#Transition-parameters']
		],
		[
			'custom-transition-functions ',
			['Custom transition functions', '/docs/svelte/transition#Custom-transition-functions']
		],
		['transition-events ', ['Transition events', '/docs/svelte/transition#Transition-events']],
		['in-fn-out-fn ', ['`in:fn`/`out:fn`', '/docs/svelte/in-and-out']],
		['animate-fn ', ['`animate:fn`', '/docs/svelte/animate']],
		[
			'animation-parameters ',
			['Animation Parameters', '/docs/svelte/animate#Animation-Parameters']
		],
		[
			'custom-animation-functions ',
			['Custom animation functions', '/docs/svelte/animate#Custom-animation-functions']
		]
	]);
</script>

<RemovedPage {docs} />
