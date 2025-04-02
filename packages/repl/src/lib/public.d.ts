import type { OutputChunk, RollupError } from '@rollup/browser';

export interface BundleResult {
	uid: number;
	error: (RollupError & CompileError) | null;
	client: OutputChunk | null; // TODO
	server: OutputChunk | null; // TODO
	tailwind: string | null;
	imports: string[];
}

export * from './index';
