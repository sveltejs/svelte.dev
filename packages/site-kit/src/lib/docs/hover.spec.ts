import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { beforeNavigate } from '$app/navigation';
import { mount, onMount, unmount } from 'svelte';
import { setupDocsHovers } from './hover';

vi.mock('$app/navigation', () => ({ beforeNavigate: vi.fn() }));
vi.mock('svelte', () => ({ mount: vi.fn(), onMount: vi.fn(), unmount: vi.fn() }));
vi.mock('./Tooltip.svelte', () => ({ default: {} }));

beforeEach(() => {
	vi.useFakeTimers();
	vi.clearAllMocks();
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

function setup() {
	const listeners = new Map<string, (event: any) => void>();
	vi.stubGlobal('window', {
		scrollX: 0,
		scrollY: 0,
		addEventListener: (type: string, listener: (event: any) => void) => {
			listeners.set(type, listener);
		},
		removeEventListener: (type: string) => listeners.delete(type)
	});
	vi.stubGlobal('document', { body: {} });

	const classes = new Set(['twoslash-hover']);
	const target = {
		closest: (selector: string) => (selector === '.twoslash-hover' ? target : null),
		querySelector: () => ({ innerHTML: 'type information' }),
		getBoundingClientRect: () => ({ left: 0, right: 20, top: 0 }),
		classList: {
			add: (name: string) => classes.add(name),
			remove: (name: string) => classes.delete(name),
			contains: (name: string) => classes.has(name)
		},
		parentElement: null
	};

	vi.mocked(mount).mockReturnValue({});
	setupDocsHovers();
	const destroy = vi.mocked(onMount).mock.calls.at(-1)![0]() as () => void;
	const navigate = vi.mocked(beforeNavigate).mock.calls.at(-1)![0];
	const dispatch = (type: string, source: unknown = target) => {
		listeners.get(type)?.({ target: source, buttons: 0 });
	};

	return { classes, listeners, dispatch, destroy, navigate };
}

it('dismisses tooltips on link activation without needing mouseout', () => {
	const { classes, dispatch, destroy } = setup();
	const link = { closest: (selector: string) => (selector === 'a[href]' ? link : null) };

	for (const event of ['click', 'auxclick']) {
		dispatch('mouseover');
		expect(classes.has('highlight')).toBe(true);
		dispatch(event, link);
		expect(classes.has('highlight')).toBe(false);
	}

	expect(unmount).toHaveBeenCalledTimes(2);
	destroy();
});

it('clears mounted tooltips and pending timers on navigation and teardown', () => {
	const { classes, listeners, dispatch, destroy, navigate } = setup();

	dispatch('mouseover');
	dispatch('mouseout');
	navigate({} as Parameters<typeof navigate>[0]);
	expect(classes.has('highlight')).toBe(false);
	expect(vi.getTimerCount()).toBe(0);

	dispatch('mouseover');
	dispatch('mouseout');
	destroy();
	expect(classes.has('highlight')).toBe(false);
	expect(vi.getTimerCount()).toBe(0);
	expect(listeners.size).toBe(0);
	expect(unmount).toHaveBeenCalledTimes(2);
});

it('keeps tooltip hover transfer working without leaving stale mouseout timers', () => {
	const { classes, dispatch, destroy } = setup();

	dispatch('mouseover');
	dispatch('click');
	expect(classes.has('highlight')).toBe(true);
	dispatch('mouseout');
	dispatch('mouseout');
	expect(vi.getTimerCount()).toBe(1);
	const props = vi.mocked(mount).mock.calls.at(-1)![1]!.props as {
		onmouseenter: () => void;
		onmouseleave: () => void;
	};
	props.onmouseenter();
	vi.runAllTimers();
	expect(classes.has('highlight')).toBe(true);
	props.onmouseleave();
	vi.runAllTimers();
	expect(classes.has('highlight')).toBe(false);
	expect(unmount).toHaveBeenCalledTimes(1);
	destroy();
});
