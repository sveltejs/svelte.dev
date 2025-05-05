<script lang="ts">
	import { format_number } from '../utils';

	// Update the type definition to use the new format
	type Props = {
		history: [number, number][]; // [day_number, value]
		color?: string;
		fill_opacity?: number;
	};

	let { history, color = 'var(--sk-fg-accent)', fill_opacity = 0.2 }: Props = $props();

	// Fixed dimensions
	const width = 1000;
	const height = 300;
	const padding = 20;

	// January 1, 2014 00:00:00 UTC - Base date for day number conversion
	const BASE_DATE = Date.UTC(2014, 0, 1);

	// Convert day number to timestamp
	function day_to_timestamp(day_number: number): number {
		return BASE_DATE + day_number * 24 * 60 * 60 * 1000;
	}

	// SVG drawing parameters
	let path_d = $state('');
	let area_path_d = $state('');
	let max_value = $state(0);
	let min_value = $state(0);
	let points: [number, number][] = $state([]);
	const complete_history = $derived(ensure_complete_history(history));

	// Ensure we have 104 weeks of data by filling in missing weeks with zeros
	function ensure_complete_history(history_data: [number, number][]): [number, number][] {
		if (!history_data || history_data.length === 0) return [];

		// Sort data by day number (first element of tuple)
		const sorted_data = [...history_data].sort((a, b) => a[0] - b[0]);

		// If we already have 104+ entries, just return the most recent 104
		if (sorted_data.length >= 104) {
			return sorted_data.slice(-104);
		}

		// We need to add entries to reach 104
		const needed_entries = 104 - sorted_data.length;

		// Find the earliest day in our data
		const earliest_day = sorted_data[0][0];

		// Create a set of existing day numbers for quick lookup
		const existing_days = new Set(sorted_data.map((entry) => entry[0]));

		// Generate new entries with earlier dates
		const new_entries: [number, number][] = [];

		// Start from the earliest day and go back in time
		let current_day = earliest_day - 7; // Go back one week from earliest

		for (let i = 0; i < needed_entries; i++) {
			// Check if this day already exists in our data
			if (!existing_days.has(current_day)) {
				// Add new entry with zero downloads
				new_entries.push([current_day, 0]);
			}

			// Move back one more week
			current_day -= 7;
		}

		// Combine and sort all entries
		const result = [...new_entries, ...sorted_data].sort((a, b) => a[0] - b[0]);

		// Return the most recent 104 entries
		return result.slice(-104);
	}

	// Date formatter
	const format_date = (day_number: number) => {
		const date = new Date(day_to_timestamp(day_number));
		const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
		return `${months[date.getUTCMonth()]} ${date.getUTCFullYear().toString().substr(2)}`;
	};

	// Helper function to create a smooth curve using cubic bezier splines
	function create_smooth_path(points: [number, number][]): string {
		if (points.length < 2) return '';

		// Start with the first point
		let path = `M ${points[0][0]} ${points[0][1]}`;

		// For each segment between points, we'll calculate control points
		for (let i = 0; i < points.length - 1; i++) {
			const current = points[i];
			const next = points[i + 1];

			// Calculate the horizontal distance between points
			const dx = next[0] - current[0];

			// Control points at 1/3 and 2/3 of the horizontal distance
			// This creates a smooth curve while respecting the data points
			const ctrl1_x = current[0] + dx / 3;
			const ctrl2_x = current[0] + (dx * 2) / 3;

			// Use the actual y-values for a natural curve
			const ctrl1_y = current[1];
			const ctrl2_y = next[1];

			// Add the cubic bezier curve segment
			path += ` C ${ctrl1_x} ${ctrl1_y}, ${ctrl2_x} ${ctrl2_y}, ${next[0]} ${next[1]}`;
		}

		return path;
	}

	// Calculate the SVG paths
	function calculate_paths() {
		if (complete_history.length === 0) return;

		// Find min and max values for scaling
		max_value = Math.max(...complete_history.map((d) => d[1]));
		min_value = Math.min(...complete_history.map((d) => d[1]));

		// Add 10% padding to max value for better visualization
		max_value = max_value * 1.1;

		// Calculate chart area
		const chart_width = width - padding * 2;
		const chart_height = height - padding * 2;

		const x_scale = (day_number: number) => {
			const min = complete_history[0][0];
			const max = complete_history[complete_history.length - 1][0] + 7; // Add 7 days for the week range
			return padding + ((day_number - min) / (max - min)) * chart_width;
		};

		const y_scale = (y: number) => {
			return height - padding - (y / max_value) * chart_height;
		};

		// Create points
		points = complete_history.map((d) => [x_scale(d[0]), y_scale(d[1])]);

		// Create a smooth curved path using bezier curves instead of lines
		path_d = create_smooth_path(points);

		// Create the path for the area with smooth top edge
		const last_x = x_scale(complete_history[complete_history.length - 1][0]);
		const first_x = x_scale(complete_history[0][0]);
		const bottom_y = height - padding;

		area_path_d = path_d + ` L ${last_x} ${bottom_y}` + ` L ${first_x} ${bottom_y}` + ' Z';
	}

	// onMount(() => {
	calculate_paths();
	// });
</script>

<div class="chart-container">
	{#if !complete_history || complete_history.length === 0}
		<div class="no-data">No download data available</div>
	{:else}
		<svg viewBox="0 0 {width} {height}" class="chart-svg">
			<!-- Foreground/chart elements -->
			<g class="chart-elements">
				<!-- Area fill -->
				<path d={area_path_d} fill={color} fill-opacity={fill_opacity} stroke="none" />

				<!-- Line -->
				<path d={path_d} fill="none" stroke={color} stroke-width="2" />

				<!-- Y-axis -->
				<line
					x1={padding}
					y1={padding}
					x2={padding}
					y2={height - padding}
					stroke="currentColor"
					stroke-width="1"
					opacity="0.2"
				/>

				<!-- X-axis -->
				<line
					x1={padding}
					y1={height - padding}
					x2={width - padding}
					y2={height - padding}
					stroke="currentColor"
					stroke-width="1"
					opacity="0.2"
				/>

				<!-- Y-axis grid lines (every 25% of max value) -->
				{#each [0.25, 0.5, 0.75] as ratio}
					{@const y_pos = height - padding - ratio * (height - padding * 2)}
					<line
						x1={padding}
						y1={y_pos}
						x2={width - padding}
						y2={y_pos}
						stroke="currentColor"
						stroke-width="1"
						opacity="0.1"
					/>
				{/each}
			</g>
		</svg>

		<!-- SVG overlay for labels - these will maintain their size -->
		<div class="labels-overlay">
			<!-- Y-axis value labels -->
			{#each [0, 0.25, 0.5, 0.75, 1] as ratio}
				{@const y_percent =
					100 - ratio * (100 - (padding / height) * 100 * 2) - (padding / height) * 100}
				{@const label_value = format_number(Math.round(max_value * ratio))}
				<div class="y-label" style="top: {y_percent}%; left: {((padding - 5) / width) * 100}%;">
					{label_value}
				</div>
			{/each}

			<!-- X-axis date labels -->
			{#each complete_history as data, i}
				{@const skip_factor = Math.ceil(complete_history.length / 13)}
				{#if i % skip_factor === 0 && points[i]}
					{@const x_percent = (points[i][0] / width) * 100}
					<div
						class="x-label"
						style="bottom: {((padding - 25) / height) * 100}%; left: {x_percent}%;"
					>
						{format_date(data[0])}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.chart-container {
		position: relative;
		width: 100%;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		margin: 20px 0;
	}

	.chart-svg {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
		position: relative;
		z-index: 1;
	}

	.no-data {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 200px;
		color: currentColor;
		opacity: 0.6;
	}

	.labels-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 2;
	}

	.y-label {
		position: absolute;
		transform: translateY(-50%) translateX(-100%);
		text-align: right;
		font: var(--sk-font-ui-small);
		color: currentColor;
		opacity: 0.7;
	}

	.x-label {
		position: absolute;
		transform: translateX(-50%);
		font: var(--sk-font-ui-small);
		text-align: center;
		opacity: 0.7;
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.y-label,
		.x-label {
			font-size: 9px !important;
		}
	}

	@media (max-width: 350px) {
		.x-label {
			font-size: 8px;
		}
	}
</style>
