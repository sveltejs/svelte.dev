import type { CompileError, CompileResult, Warning } from 'svelte/compiler';
import type { CompileOptions, File } from '../types';

export interface CompilerInput {
	id: number;
	type: 'compile' | 'init';
	source: string;
	options: CompileOptions;
	is_entry: boolean;
	return_ast: boolean;
	svelte_url?: string;
}

export interface CompilerOutput {
	id: number;
	result: {
		js: string;
		css: string;
		ast?: CompileResult['ast'];
		error?: CompileError;
		warnings: Warning[];
		metadata?: {
			runes: boolean;
		};
	};
}

export type BundleMessageData = {
	uid: number;
	type: 'init' | 'bundle' | 'status';
	message: string;
	packages_url: string;
	svelte_url: string;
	files: File[];
};

export type MigrateMessageData = {
	id: number;
	result: { code: string };
	error?: string;
};
