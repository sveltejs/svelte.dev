export interface Block {
	breadcrumbs: string[];
	href: string;
	content: string;
	rank: number;
}

export interface BlockGroup {
	breadcrumbs: string[];
	blocks: Block[];
}
