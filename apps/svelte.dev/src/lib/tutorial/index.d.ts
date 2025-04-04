import type { Writable } from 'svelte/store';
import type { File, Directory, Item } from '@sveltejs/repl/workspace';

export interface Adapter {
	/** Returns `false` if the reset was in such a way that a reload of the iframe isn't needed */
	reset(files: Array<Item>): Promise<boolean>;
	update(file: File): Promise<boolean>;
}

export interface Scope {
	prefix: string;
	name: string;
}

export interface Exercise {
	part: {
		slug: string;
		title: string;
		label: string;
	};
	chapter: {
		slug: string;
		title: string;
	};
	scope: Scope;
	focus: string;
	title: string;
	/** the initial path to navigate to */
	path: string;
	slug: string;
	prev: { slug: string; title: string } | null;
	next: { slug: string; title: string } | null;
	markdown: string;
	html: string;
	dir: string;
	editing_constraints: {
		create: Set<string>;
		remove: Set<string>;
	};
	a: Record<string, string>;
	b: Record<string, string>;
	has_solution: boolean;
}

export interface ExerciseStub {
	title: string;
	slug: string;
}

export interface ChapterStub {
	slug: string;
	title: string;
	exercises: ExerciseStub[];
}

export interface PartStub {
	slug: string;
	title: string;
	chapters: ChapterStub[];
}

export interface EditingConstraints {
	create: Set<string>;
	remove: Set<string>;
}

export interface MenuItem {
	icon: string;
	label: string;
	fn: () => void;
}
