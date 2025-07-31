export interface NavigationLink {
	title: string;
	slug: string;
	sections?: {
		title: string;
		path?: string;
		sections: {
			title: string;
			path?: string;
			sections: {
				title: string;
				path: string;
				badge?: string;
			}[];
		}[];
	}[];
}

export interface Document {
	slug: string;
	file: string;
	metadata: {
		title: string;
		[key: string]: any;
	};
	breadcrumbs: Array<{ title: string }>;
	body: string;
	sections: Section[];
	children: Document[];
	assets?: Record<string, string>;
	next: null | { slug: string; title: string };
	prev: null | { slug: string; title: string };
}

export interface DocumentSummary {
	slug: string;
	metadata: {
		title: string;
		[key: string]: any;
	};
	children: DocumentSummary[];
}

export interface Section {
	slug: string;
	title: string;
}

export interface BannerData {
	id: string;
	start: Date;
	end: Date;
	arrow: boolean;
	href: string;
	content: {
		lg?: string;
		sm?: string;
	};
}
