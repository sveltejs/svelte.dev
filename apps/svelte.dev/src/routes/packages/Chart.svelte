<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { onMount, untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { format_number } from './utils';

	type Props = {
		history: Package['downloads_history'];
		height?: string | number;
		color?: string;
		fill_opacity?: number;
	};

	let {
		history,
		height = '300', // Now a string with optional units or number
		color = 'var(--sk-fg-accent)', // Default blue color
		fill_opacity = 0.2
	}: Props = $props();

	// Local state
	let container_width = $state<number>();
	let container_height = $state<number>();
	let container = $state<HTMLElement>();

	// SVG drawing parameters
	let path_d = $state('');
	let area_path_d = $state('');
	let max_value = $state(0);
	let min_value = $state(0);
	let points: [number, number][] = $state([]);
	const complete_history = $derived(ensure_complete_history(history));

	// Ensure we have 104 weeks of data by filling in missing weeks with zeros
	function ensure_complete_history(
		history_data: Package['downloads_history']
	): Package['downloads_history'] {
		if (!history_data || history_data.length === 0) return [];

		// Sort data by start date (first element of range)
		const sorted_data = [...history_data].sort((a, b) => a.range[0] - b.range[0]);

		// If we already have 104+ entries, just return the most recent 104
		if (sorted_data.length >= 104) {
			return sorted_data.slice(-104);
		}

		// We need to add entries to reach 104
		const needed_entries = 104 - sorted_data.length;

		// Find the earliest date in our data
		const earliest_date = new Date(sorted_data[0].range[0]);

		// Create a map of existing timestamps for quick lookup
		const existing_timestamps = new Set(sorted_data.map((entry) => entry.range[0]));

		// Generate new entries with earlier dates
		const new_entries: Package['downloads_history'] = [];

		// Start from the earliest date and go back in time
		const current_date = new Date(earliest_date);
		current_date.setDate(current_date.getDate() - 7); // Go back one week from earliest

		for (let i = 0; i < needed_entries; i++) {
			// Create range for this week
			const start_timestamp = current_date.getTime();

			// Check if this timestamp already exists in our data
			if (!existing_timestamps.has(start_timestamp)) {
				// Calculate end timestamp (7 days minus 1 millisecond)
				const end_date = new Date(current_date);
				end_date.setDate(end_date.getDate() + 7);
				end_date.setMilliseconds(-1);

				// Add new entry with zero downloads
				new_entries.push({
					range: [start_timestamp, end_date.getTime()],
					value: 0
				});
			}

			// Move back one more week
			current_date.setDate(current_date.getDate() - 7);
		}

		// Combine and sort all entries
		const result = [...new_entries, ...sorted_data].sort((a, b) => a.range[0] - b.range[0]);

		// Return the most recent 104 entries
		return result.slice(-104);
	}

	// Date formatter
	const format_date = (timestamp: number) => {
		const date = new Date(timestamp);
		const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
		return `${months[date.getMonth()]} ${date.getFullYear().toString().substr(2)}`;
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

	// Calculate the SVG paths once we have data and dimensions
	$effect(() => {
		if (complete_history.length > 0 && container_width && container_height)
			untrack(() => calculate_paths());
	});

	function calculate_paths() {
		if (complete_history.length === 0 || !container_width || !container_height) return;

		// Find min and max values for scaling
		max_value = Math.max(...complete_history.map((d) => d.value));
		min_value = Math.min(...complete_history.map((d) => d.value));

		// Add 10% padding to max value for better visualization
		max_value = max_value * 1.1;

		// Calculate points for the chart
		const padding = Math.min(40, container_width * 0.1); // Responsive padding
		const chart_width = container_width - padding * 2;
		const chart_height = container_height - padding * 2;

		const x_scale = (x: number) => {
			const min = complete_history[0].range[0];
			const max = complete_history[complete_history.length - 1].range[1];
			return padding + ((x - min) / (max - min)) * chart_width;
		};

		const y_scale = (y: number) => {
			return container_height! - padding - (y / max_value) * chart_height;
		};

		// Create points
		points = complete_history.map((d) => [x_scale(d.range[0]), y_scale(d.value)]);

		// Create a smooth curved path using bezier curves instead of lines
		path_d = create_smooth_path(points);

		// Create the path for the area with smooth top edge
		const last_x = x_scale(complete_history[complete_history.length - 1].range[0]);
		const first_x = x_scale(complete_history[0].range[0]);
		const bottom_y = container_height - padding;

		area_path_d = path_d + ` L ${last_x} ${bottom_y}` + ` L ${first_x} ${bottom_y}` + ' Z';
	}

	// Handle resize
	function handle_resize() {
		if (container) {
			container_width = container.clientWidth;
			container_height =
				typeof height === 'number' ? height : parseInt(height, 10) || container.clientWidth * 0.5; // Default to 50% of width
		}
	}

	onMount(() => {
		handle_resize();

		return on(window, 'resize', handle_resize);
	});
</script>

<div
	class="chart-container"
	bind:this={container}
	style="height: {typeof height === 'string' ? height : `${height}px`};"
>
	{#if !complete_history || complete_history.length === 0}
		<div class="no-data" style="width: {container_width}px; height: {container_height}px">
			No download data available
		</div>
	{:else if container_width && container_height}
		<svg width={container_width} height={container_height}>
			<!-- Y-axis grid lines (every 25% of max value) -->
			{#each [0.25, 0.5, 0.75] as ratio}
				{@const y_pos =
					container_height -
					Math.min(40, container_width * 0.1) -
					ratio * (container_height - Math.min(40, container_width * 0.1) * 2)}
				<line
					x1={Math.min(40, container_width * 0.1)}
					y1={y_pos}
					x2={container_width - Math.min(40, container_width * 0.1)}
					y2={y_pos}
					stroke="currentColor"
					stroke-width="1"
					opacity="0.1"
				/>
				<text
					x={Math.min(35, container_width * 0.09)}
					y={y_pos + 5}
					text-anchor="end"
					font-size={Math.max(10, Math.min(12, container_width * 0.02))}
					fill="currentColor"
					opacity="0.7"
				>
					{format_number(Math.round(max_value * ratio))}
				</text>
			{/each}

			<!-- X-axis labels (adaptive based on container width) -->
			{#each complete_history as data, i}
				{@const skip_factor = Math.ceil(
					complete_history.length / Math.min(13, Math.max(4, container_width / 100))
				)}
				{#if i % skip_factor === 0}
					<text
						x={points[i]?.[0] || 0}
						y={container_height - Math.min(20, container_height * 0.06)}
						text-anchor="middle"
						font-size={Math.max(8, Math.min(10, container_width * 0.015))}
						fill="currentColor"
						opacity="0.7"
					>
						{format_date(data.range[0])}
					</text>
				{/if}
			{/each}

			<!-- Area fill -->
			<path d={area_path_d} fill={color} fill-opacity={fill_opacity} stroke="none" />

			<!-- Line -->
			<path d={path_d} fill="none" stroke={color} stroke-width="2" />

			<!-- Y-axis -->
			<line
				x1={Math.min(40, container_width * 0.1)}
				y1={Math.min(40, container_height * 0.1)}
				x2={Math.min(40, container_width * 0.1)}
				y2={container_height - Math.min(40, container_height * 0.1)}
				stroke="currentColor"
				stroke-width="1"
				opacity="0.2"
			/>

			<!-- X-axis -->
			<line
				x1={Math.min(40, container_width * 0.1)}
				y1={container_height - Math.min(40, container_height * 0.1)}
				x2={container_width - Math.min(40, container_width * 0.1)}
				y2={container_height - Math.min(40, container_height * 0.1)}
				stroke="currentColor"
				stroke-width="1"
				opacity="0.2"
			/>

			<!-- Max value label -->
			<text
				x={Math.min(35, container_width * 0.09)}
				y={Math.min(45, container_height * 0.15)}
				text-anchor="end"
				font-size={Math.max(10, Math.min(12, container_width * 0.02))}
				fill="currentColor"
				opacity="0.7"
			>
				{format_number(Math.round(max_value))}
			</text>

			<!-- Zero value label -->
			<text
				x={Math.min(35, container_width * 0.09)}
				y={container_height - Math.min(35, container_height * 0.09)}
				text-anchor="end"
				font-size={Math.max(10, Math.min(12, container_width * 0.02))}
				fill="currentColor"
				opacity="0.7"
			>
				0
			</text>
		</svg>

		<!-- Totals summary -->
		<div class="totals">
			<div>
				<strong>Total Downloads (All Time):</strong>
				{complete_history.reduce((sum, data) => sum + data.value, 0).toLocaleString()}
			</div>
			<div>
				<strong>Latest Week:</strong>
				{complete_history[complete_history.length - 1]?.value.toLocaleString() || 0}
			</div>
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

	.no-data {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
		color: currentColor;
		opacity: 0.6;
	}

	.totals {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	@media (min-width: 640px) {
		.totals {
			flex-direction: row;
			justify-content: space-between;
		}
	}

	svg {
		overflow: visible;
	}
</style>
