import type { CompileError, CompileOptions, CompileResult, Warning } from 'svelte/compiler';
import type { File } from 'editor';

export type CompilerCommand =
	| {
			id: number;
			type: 'init';
			svelte_url: string;
	  }
	| {
			id: number;
			type: 'compile';
			payload: CompilerInput;
	  }
	| {
			id: number;
			type: 'migrate';
			payload: MigrateInput;
	  };

export interface CompilerInput {
	source: string;
	options: CompileOptions;
	is_entry: boolean;
	return_ast: boolean;
	svelte_url?: string;
}

export interface CompilerOutput {
	js: string;
	css: string;
	ast?: CompileResult['ast'];
	error?: CompileError;
	warnings: Warning[];
	metadata?: {
		runes: boolean;
	};
}

export interface MigrateInput {
	source: string;
}

export interface MigrateOutput {
	result: {
		code: string;
	};
	error?: string;
}

export type BundleMessageData = {
	uid: number;
	type: 'init' | 'bundle' | 'status';
	message: string;
	packages_url: string;
	svelte_url: string;
	files: File[];
	options: CompileOptions;
};

declare global {
	var svelte: typeof import('svelte/compiler');
}
