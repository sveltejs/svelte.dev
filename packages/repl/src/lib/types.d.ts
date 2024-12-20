import type { EditorState } from '@codemirror/state';
import { OutputChunk, RollupError } from '@rollup/browser';
import type { Readable, Writable } from 'svelte/store';
import type { CompileError } from 'svelte/compiler';
import type { Workspace } from 'editor';

export type Lang = 'js' | 'svelte' | 'json' | 'md' | 'css' | (string & Record<never, never>);

type StartOrEnd = {
	line: number;
	column: number;
	character: number;
};

export type MessageDetails = {
	start: StartOrEnd;
	end: StartOrEnd;
	filename: string;
	message: string;
};

export type Warning = MessageDetails;

export type Bundle = {
	uid: number;
	client: OutputChunk | null;
	error: (RollupError & CompileError) | null;
	server: OutputChunk | null;
	imports: string[];
	warnings: Warning[];
};

export type File = {
	name: string;
	source: string;
	type: Lang;
	modified?: boolean;
};

export type ReplState = {
	bundle: Bundle | null;
	bundler: import('./Bundler').default | null;
	toggleable: boolean;
};

export type ReplContext = {
	bundle: Writable<ReplState['bundle']>;
	toggleable: Writable<ReplState['toggleable']>;
	workspace: Workspace;
};
