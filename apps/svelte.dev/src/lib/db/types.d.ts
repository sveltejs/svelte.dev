export type UserID = number | string;

export interface GitHubSessionUser {
	provider: 'github';
	id: number;
	github_name: string;
	github_login: string;
	github_avatar_url: string;
}

export interface AtprotoSessionUser {
	provider: 'atproto';
	/** the DID */
	id: string;
	did: string;
	handle: string;
	display_name: string;
	avatar: string;
	pds: string;
	/** the user's PDS runs a spaces build */
	spaces_supported: boolean;
	/** the user granted the space scope and the space exists */
	private_apps: boolean;
}

export type User = GitHubSessionUser | AtprotoSessionUser;

export interface Accounts {
	github: GitHubSessionUser | null;
	atproto: AtprotoSessionUser | null;
}

export interface GitHubUser {
	github_id: string;
	github_name: string;
	github_login: string;
	github_avatar_url: string;
}

export interface Gist {
	id: string;
	name: string;
	owner: UserID | null;
	/** Whether Tailwind is enabled for this playground app */
	tailwind?: boolean;
	files: Array<{ name: string; type: string; source: string }>;
	// atproto only
	owner_handle?: string;
	private?: boolean;
	svelte_version?: string;
	async?: boolean;
	/** at:// URI or svelte.dev URL */
	forked_from?: string;
}
