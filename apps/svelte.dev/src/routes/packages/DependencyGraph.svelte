<script lang="ts">
	import type { FlatDependencyGraph, PackageDependencyNode } from '$lib/server/content';
	import { format_bytes } from './utils';

	type Props = {
		graph: FlatDependencyGraph;
	};

	const { graph }: Props = $props();

	// Convert the flat graph to a nested structure for rendering
	function buildTree() {
		if (!graph) return null;

		// Create mapping of dependencies by parent
		const childrenMap = new Map<number, number[]>();

		// Initialize with empty arrays for all packages
		for (let i = 0; i < graph.packages.length; i++) {
			childrenMap.set(i, []);
		}

		// Fill in the children for each package
		for (const [from, to] of graph.dependencies) {
			childrenMap.get(from)!.push(to);
		}

		// Set to track visited nodes (prevent infinite recursion with circular deps)
		const visited = new Set();

		// Recursive function to build tree node
		function buildNode(index: number): Omit<PackageDependencyNode, 'dependencies'> & {
			children: any;
		} {
			if (visited.has(index)) {
				// Handle circular reference
				const pkg = graph.packages[index];
				return {
					name: pkg.name,
					version: pkg.version,
					isCircular: true,
					children: []
				};
			}

			visited.add(index);

			const pkg = graph.packages[index];
			const children = childrenMap.get(index) || [];

			return {
				name: pkg.name,
				version: pkg.version,
				size: pkg.size,
				isCircular: pkg.isCircular,
				children: children.map((childIndex) => buildNode(childIndex))
			};
		}

		// Start from the root
		return buildNode(graph.rootIndex);
	}

	// Build the tree when the graph changes
	const tree = $derived(buildTree());

	// Recursive component for tree nodes
	const TreeNode = {
		// Simple recursive function to render the tree
		render: (node: Omit<PackageDependencyNode, 'dependencies'> & { children: any }, depth = 0) => {
			if (!node) return '';

			// Create indentation based on depth
			const indent = '  '.repeat(depth);

			// Format node with name@version
			const nodeText = `${node.name}@${node.version}`;

			// Add circular indicator if needed
			const circularMark = node.isCircular ? ' [circular ⟳]' : '';

			// Add size if available
			const sizeText = node.size ? ` (${format_bytes(node.size)})` : '';

			// Combine everything
			let output = `${indent}${nodeText}${sizeText}${circularMark}\n`;

			// Add children recursively
			for (const child of node.children) {
				output += TreeNode.render(child, depth + 1);
			}

			return output;
		}
	};
</script>

<div class="dependency-tree">
	{#if tree}
		<pre>{TreeNode.render(tree)}</pre>
	{:else}
		<p>No dependency data available</p>
	{/if}
</div>

<style>
	.dependency-tree {
		font: var(--sk-font-mono);
		white-space: pre;
		max-height: 500px;
		overflow: auto;
		border: 1px solid #ccc;
		padding: 10px;
		/* background-color: #f5f5f5; */
	}

	pre {
		margin: 0;
	}
</style>
