const S32 = '234567abcdefghijklmnopqrstuvwxyz';

let last = 0;

function s32(n: number, len: number) {
	let s = '';
	for (let i = 0; i < len; i++) {
		s = S32[n % 32] + s;
		n = Math.floor(n / 32);
	}
	return s;
}

/** atproto TID: 13 chars, sortable, microsecond timestamp + clock id. */
export function tid() {
	// monotonic: two calls in the same microsecond still order correctly
	let us = Date.now() * 1000;
	if (us <= last) us = last + 1;
	last = us;
	const clock = Math.floor(Math.random() * 32);
	return s32(us, 11) + s32(clock, 2);
}
