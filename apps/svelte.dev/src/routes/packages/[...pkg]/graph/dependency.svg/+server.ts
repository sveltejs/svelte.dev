import { registry, type Package } from '$lib/server/content';
import { error, text } from '@sveltejs/kit';
import { format_bytes } from '../../../utils';

export const prerender = true;

export async function GET({ params }) {
	const { pkg } = params;

	const pkg_data = registry.find((v) => v.name === pkg);
	if (!pkg_data) error(404);

	return text(generate_dependency_graph_svg(pkg_data), {
		headers: {
			'Content-type': 'image/svg+xml'
		}
	});
}

export async function entries() {
	return registry.map((v) => {
		return {
			pkg: v.name
		};
	});
}

/**
 * Truncate text to a specific length with ellipsis
 */
function truncate(text: string, max_length = 20): string {
	return text.length > max_length ? text.substring(0, max_length) + '...' : text;
}

/**
 * Generate an SVG string representation of a package dependency graph
 *
 * @param pkg The package object with dependency graph data
 * @param max_depth Maximum depth of dependencies to display (default: 15)
 * @returns SVG string representation of the dependency graph
 */
function generate_dependency_graph_svg(pkg: Package, max_depth: number = 25): string {
	// Layout configuration
	const NODE_WIDTH = 180;
	const NODE_HEIGHT = 60;
	const LEVEL_GAP = 200;
	const NODE_GAP = 40;
	const MARGIN = 50;

	// Extract the dependency graph from the package
	const graph = pkg.dependency_tree;

	if (
		!graph ||
		!graph.packages ||
		!graph.dependencies ||
		graph.rootIndex === undefined ||
		graph.rootIndex < 0 ||
		graph.rootIndex >= graph.packages.length
	) {
		return `<svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="100" fill="#fff5f5" stroke="#f56565" rx="4" ry="4"/>
      <text x="150" y="50" font-family="sans-serif" text-anchor="middle" fill="#e53e3e">
        No dependency data available
      </text>
    </svg>`;
	}

	// Define types for positioned nodes
	type PositionedNode = {
		id: number;
		name: string;
		version: string;
		size?: number;
		is_circular: boolean;
		x: number;
		y: number;
		level: number;
	};

	type Connection = {
		from_id: number;
		to_id: number;
		is_circular: boolean;
	};

	// Create adjacency lists for dependencies
	const outgoing_edges = new Map<number, number[]>();
	for (let i = 0; i < graph.packages.length; i++) {
		outgoing_edges.set(i, []);
	}

	for (const [from, to] of graph.dependencies) {
		outgoing_edges.get(from)?.push(to);
	}

	// Assign levels to nodes
	const node_levels = new Map<number, number>();
	node_levels.set(graph.rootIndex, 0);

	// Assign levels using topological sort
	function assign_levels(node_index: number, current_level: number, path = new Set<number>()) {
		// Skip if beyond max depth
		if (current_level > max_depth) return;

		// Skip circular dependencies in level calculation
		if (path.has(node_index)) return;

		// Skip if this node is already at a deeper level
		if (node_levels.has(node_index) && node_levels.get(node_index)! <= current_level) {
			// Update level and proceed only if we've found a shorter path
			node_levels.set(node_index, current_level);
		} else if (!node_levels.has(node_index)) {
			// First time seeing this node
			node_levels.set(node_index, current_level);
		} else {
			// Already processed at a better level
			return;
		}

		// Add to processed path
		const new_path = new Set(path);
		new_path.add(node_index);

		// Process all outgoing dependencies
		const dependencies = outgoing_edges.get(node_index) || [];

		for (const dep_index of dependencies) {
			// Skip if out of bounds
			if (dep_index < 0 || dep_index >= graph.packages.length) continue;

			// Recursively assign levels to dependencies
			assign_levels(dep_index, current_level + 1, new_path);
		}
	}

	// Start level assignment from root
	assign_levels(graph.rootIndex, 0);

	// Group nodes by level
	const nodes_by_level = new Map<number, number[]>();
	for (const [node_index, level] of node_levels.entries()) {
		if (level > max_depth) continue;

		if (!nodes_by_level.has(level)) {
			nodes_by_level.set(level, []);
		}
		nodes_by_level.get(level)!.push(node_index);
	}

	// Sort nodes at each level
	for (const level of nodes_by_level.keys()) {
		nodes_by_level.get(level)!.sort((a, b) => {
			const pkg_a = graph.packages[a];
			const pkg_b = graph.packages[b];
			return pkg_a.name.localeCompare(pkg_b.name);
		});
	}

	// Position nodes
	let max_x = 0;
	let max_y = 0;
	const nodes: PositionedNode[] = [];

	// Create positioned nodes
	for (const [level, node_indices] of nodes_by_level.entries()) {
		const level_x = MARGIN + level * (NODE_WIDTH + LEVEL_GAP);
		max_x = Math.max(max_x, level_x + NODE_WIDTH);

		node_indices.forEach((node_index, index) => {
			const pkg = graph.packages[node_index];
			const y = MARGIN + index * (NODE_HEIGHT + NODE_GAP);
			max_y = Math.max(max_y, y + NODE_HEIGHT);

			nodes.push({
				id: node_index,
				name: pkg.name,
				version: pkg.version,
				size: pkg.size,
				is_circular: !!pkg.isCircular,
				x: level_x,
				y: y,
				level: level
			});
		});
	}

	// Create connections
	const connections: Connection[] = [];
	for (const [from, to] of graph.dependencies) {
		// Skip if any node is out of bounds or beyond max depth
		if (from < 0 || from >= graph.packages.length || to < 0 || to >= graph.packages.length) {
			continue;
		}

		const from_level = node_levels.get(from);
		const to_level = node_levels.get(to);

		// Skip if either node wasn't assigned a level
		if (from_level === undefined || to_level === undefined) continue;

		// Skip if beyond max depth
		if (from_level > max_depth || to_level > max_depth) continue;

		// Check if this is a circular dependency
		const is_circular = graph.circular.some(([f, t]) => f === from && t === to);

		connections.push({
			from_id: from,
			to_id: to,
			is_circular
		});
	}

	// Set SVG dimensions with some extra margin
	const svg_width = max_x + MARGIN;
	const svg_height = max_y + MARGIN;

	// Generate a path between two nodes
	function generate_path(from_node: PositionedNode, to_node: PositionedNode): string {
		const source_x = from_node.x + NODE_WIDTH;
		const source_y = from_node.y + NODE_HEIGHT / 2;
		const target_x = to_node.x;
		const target_y = to_node.y + NODE_HEIGHT / 2;

		const control_dist = Math.min(80, (to_node.x - from_node.x) / 2);

		return `M ${source_x} ${source_y} C ${source_x + control_dist} ${source_y}, ${target_x - control_dist} ${target_y}, ${target_x} ${target_y}`;
	}

	// Get node by id
	function get_node_by_id(id: number): PositionedNode | undefined {
		return nodes.find((node) => node.id === id);
	}

	// Start building the SVG string
	let svg = `<svg width="${svg_width}" height="${svg_height}" viewBox="0 0 ${svg_width} ${svg_height}" xmlns="http://www.w3.org/2000/svg">`;

	// Add defs section with arrow markers
	svg += `
    <defs>
      <marker 
        id="arrow" 
        viewBox="0 0 10 10" 
        refX="9" 
        refY="5"
        markerWidth="6" 
        markerHeight="6"
        orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#a0aec0" />
      </marker>
      <marker 
        id="circular-arrow" 
        viewBox="0 0 10 10" 
        refX="9" 
        refY="5"
        markerWidth="6" 
        markerHeight="6"
        orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#e53e3e" />
      </marker>
    </defs>`;

	// Add connection paths
	for (const connection of connections) {
		const from_node = get_node_by_id(connection.from_id);
		const to_node = get_node_by_id(connection.to_id);

		if (from_node && to_node) {
			const path_data = generate_path(from_node, to_node);
			const stroke = connection.is_circular ? '#e53e3e' : '#a0aec0';
			const marker = connection.is_circular ? 'url(#circular-arrow)' : 'url(#arrow)';
			const dash_array = connection.is_circular ? '5,5' : '';

			svg += `
        <path 
          d="${path_data}" 
          fill="none"
          stroke="${stroke}"
          stroke-width="1.5"
          marker-end="${marker}"
          ${dash_array ? `stroke-dasharray="${dash_array}"` : ''}
        />`;
		}
	}

	// Add nodes
	for (const node of nodes) {
		const fill = node.level === 0 ? '#ebf8ff' : node.is_circular ? '#fff5f5' : '#f7fafc';
		const stroke = node.level === 0 ? '#4299e1' : node.is_circular ? '#f56565' : '#e2e8f0';
		const text_color = node.level === 0 ? '#3182ce' : node.is_circular ? '#e53e3e' : '#4a5568';

		svg += `
      <g transform="translate(${node.x}, ${node.y})">
        <!-- Node background -->
        <rect 
          width="${NODE_WIDTH}" 
          height="${NODE_HEIGHT}" 
          rx="4" 
          ry="4" 
          fill="${fill}"
          stroke="${stroke}"
          stroke-width="1"
        />
        
        <!-- Package name -->
        <text 
          x="10" 
          y="20" 
          font-family="monospace"
          font-size="14"
          font-weight="bold"
          fill="${text_color}"
        >
          ${truncate(node.name, 20)}
        </text>
        
        <!-- Version -->
        <text 
          x="10" 
          y="38" 
          font-family="monospace"
          font-size="12"
          fill="#718096"
        >
          @${node.version}
        </text>`;

		// Add size if available
		if (node.size) {
			svg += `
        <text 
          x="10" 
          y="52" 
          font-family="monospace"
          font-size="10"
          fill="#a0aec0"
        >
          ${format_bytes(node.size)}
        </text>`;
		}

		// Add circular indicator
		if (node.is_circular) {
			svg += `
        <circle cx="${NODE_WIDTH - 10}" cy="10" r="6" fill="#f56565" />
        <text 
          x="${NODE_WIDTH - 10}" 
          y="13" 
          font-family="monospace"
          font-size="10"
          fill="white"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ⟲
        </text>`;
		}

		svg += `</g>`;
	}

	// Close the SVG tag
	svg += `</svg>`;

	return svg;
}
