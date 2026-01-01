/**
 * Formats a number with K, M, B, T suffixes
 *
 * @param num - The number to format
 * @returns Formatted string representation of the number
 *
 * Examples:
 * 437 -> 437
 * 4370 -> 4.3K
 * 43700 -> 43K
 * 437000 -> 437K
 * 4370000 -> 4.3M
 * 43700000 -> 43M
 * 437000000 -> 437M
 */
export function format_number(num: number): string {
	// Define thresholds and suffixes
	const thresholds = [
		{ value: 1e12, suffix: 'T' },
		{ value: 1e9, suffix: 'B' },
		{ value: 1e6, suffix: 'M' },
		{ value: 1e3, suffix: 'K' }
	];

	// Handle zero and negative numbers
	if (num === 0) return '0';

	const is_negative = num < 0;
	const abs_num = Math.abs(num);

	// Find the appropriate threshold
	for (const { value, suffix } of thresholds) {
		if (abs_num >= value) {
			// Calculate the divided value
			const divided = abs_num / value;

			// Format with one decimal place if the first digit is less than 10
			const formatted =
				divided < 10
					? (Math.round(divided * 10) / 10).toFixed(1).replace(/\.0$/, '')
					: Math.round(divided);

			// Return with proper sign and suffix
			return `${is_negative ? '-' : ''}${formatted}${suffix}`;
		}
	}

	// If no threshold is met, return the number as is
	return `${is_negative ? '-' : ''}${Math.round(abs_num)}`;
}
