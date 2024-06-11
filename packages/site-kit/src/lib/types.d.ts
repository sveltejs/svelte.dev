export interface NavigationLink {
	title: string;
	prefix: string;
	pathname: string;
	sections?: {
		title: string;
		sections: {
			title: string;
			sections: {
				title: string;
				path: string;
				badge?: string;
			}[];
		}[];
	}[];
}

export interface Page {
	slug: string;
	title: string;
	body: string;
	sections: Section[];
	children: Page[];
}

export interface Section {
	slug: string;
	title: string;
}
