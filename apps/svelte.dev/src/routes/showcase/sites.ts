// check a new site uses svelte, then run pnpm showcase <id> in apps/svelte.dev
// the first in each category is shown larger, so make it well known with a good screenshot
// the rest go from best known down by their rank on https://tranco-list.eu, unranked last

export type Category =
	| 'brands'
	| 'business'
	| 'news'
	| 'entertainment'
	| 'public'
	| 'ai'
	| 'tools'
	| 'developers';

export interface Site {
	/** used for the page anchor and the screenshot filename */
	id: string;
	/** as the site writes it, in its title, logo or main heading */
	name: string;
	url: string;
	/**
	 * quoted from the description meta tag, title or main heading, or another page by the same
	 * owner linked in a comment, never written or translated by hand
	 */
	description: string;
	/** language of the description if not english */
	lang?: string;
	category: Category;
	/** how pnpm showcase takes the screenshot and how the page shows it */
	screenshot?: {
		/** a page of the site to take instead, such as a shared chat that shows the app in use */
		url?: string;
		/** the site blocks headless browsers, so it is only checked with pnpm showcase --headed */
		headed?: boolean;
		/** css selectors for things to hide such as popups */
		hide?: string[];
		/** milliseconds to wait before taking the screenshot */
		delay?: number;
		/** seconds into the videos to pause them at, for one that would be caught at a blank moment */
		video?: number;
		/** the object-position of the screenshot when cropped, left top by default like a browser window */
		position?: string;
	};
}

export const categories: Array<{ id: Category; title: string }> = [
	{ id: 'brands', title: 'Consumer brands' },
	{ id: 'business', title: 'Business and industry' },
	{ id: 'news', title: 'News and media' },
	{ id: 'entertainment', title: 'Entertainment' },
	{ id: 'public', title: 'Public services' },
	{ id: 'ai', title: 'AI' },
	{ id: 'tools', title: 'Everyday' },
	{ id: 'developers', title: 'Developer' }
];

export const sites: Site[] = [
	{
		id: 'ikea',
		name: 'IKEA',
		url: 'https://www.ikea.com/global/en/',
		description: 'Furniture, home accessories, design ideas and inspiration',
		category: 'brands'
	},
	{
		id: 'yelp',
		name: 'Yelp’s Top 100 Places to Eat',
		url: 'https://top100.yelp.com/',
		description: 'Yelp chooses its top 100 places to eat and drink in the United States',
		category: 'brands'
	},
	{
		id: 'logitech',
		name: 'Logitech',
		url: 'https://www.logitech.com/en-us',
		description: 'Mechanical keyboards, wireless mice, webcams, headsets, software, and more',
		category: 'brands',
		// the discount popup and the backdrop behind it
		screenshot: { hide: ['.modal.fixed', '.fixed[class~="bg-black/80"]'] }
	},
	{
		id: 'starbucks',
		name: 'Starbucks',
		url: 'https://www.starbucks.com/',
		description: 'Order ahead, sign up for Starbucks® Rewards, manage your gift card',
		category: 'brands'
	},
	{
		id: 'logitech-g',
		name: 'Logitech G',
		url: 'https://www.logitechg.com/en-us',
		description: 'Pro-level gaming gear',
		category: 'brands'
	},
	{
		id: 'ashley',
		name: 'Ashley',
		url: 'https://www.ashleyfurniture.com/',
		description: 'Home furniture and home decor online or in-store',
		category: 'brands',
		screenshot: {
			headed: true,
			hide: [
				'.preloaded_lightbox',
				// the delivery zip code tooltip, its text, close button and arrow
				':has(+ [aria-label="Close tooltip"])',
				'[aria-label="Close tooltip"]',
				'[aria-label="Close tooltip"] + *'
			]
		}
	},
	{
		id: 'bugatti',
		name: 'Bugatti',
		url: 'https://www.bugatti.com/',
		description: 'Experience the incomparable nature of the hyper luxury brand',
		category: 'brands',
		screenshot: { hide: ['.group.fixed.bottom-3'] }
	},
	{
		id: 'dbrand',
		name: 'dbrand',
		url: 'https://dbrand.com/',
		description: 'The global leader in device customization',
		category: 'brands'
	},
	{
		id: 'mill',
		name: 'Mill',
		url: 'https://www.mill.com/',
		description: 'Turns would-be food waste into resources for the Earth',
		category: 'brands',
		screenshot: { hide: ['dialog'] }
	},
	{
		id: 'porters-paints',
		name: 'Porter’s Paints',
		url: 'https://shop.porterspaints.com/',
		description: 'Rich colour and texture in hand-made paints',
		category: 'brands',
		screenshot: { hide: ['#chat-widget-container'] }
	},

	{
		id: 'michelin',
		name: 'Michelin',
		url: 'https://www.michelin.com/en/',
		description: 'World’s leading manufacturer of life-changing composites and experiences',
		category: 'business',
		screenshot: { headed: true }
	},
	{
		id: 'square',
		name: 'Square',
		url: 'https://squareup.com/us/en',
		description: 'Power your entire business',
		category: 'business',
		screenshot: { hide: ['#salesbot-popup-container'] }
	},
	{
		id: 'schneider-electric',
		name: 'Schneider Electric',
		url: 'https://www.se.com/ww/en/',
		description: 'A global specialist in energy management, automation and digitalization',
		category: 'business',
		screenshot: { headed: true, hide: ['.green-banner-wrapper'] }
	},
	{
		id: 'block',
		name: 'Block',
		url: 'https://block.xyz/',
		description: 'Made up of Square, Cash App, Afterpay, TIDAL, Bitkey, and Proto',
		category: 'business'
	},
	{
		id: 'beyonk',
		name: 'Beyonk',
		url: 'https://beyonk.com/',
		description: 'Online event ticketing system and ticket booking software',
		category: 'business'
	},
	{
		id: 'trading-strategy',
		name: 'Trading Strategy',
		url: 'https://tradingstrategy.ai/',
		description: 'Compare 3,000+ DeFi vaults by yield, TVL, risk and fees',
		category: 'business'
	},
	{
		id: 'zenos',
		name: 'Zenos',
		url: 'https://www.zenos.com/',
		description: 'Robotics for industrial and construction productivity',
		category: 'business'
	},
	{
		id: 'modulus',
		name: 'Modulus',
		url: 'https://modulus.vision/',
		description: 'Design, web development and consulting',
		category: 'business',
		screenshot: { hide: ['.cookieConsentWrapper'] }
	},

	{
		id: 'nytimes',
		name: 'The New York Times',
		url: 'https://www.nytimes.com/',
		description: 'Live news, investigations, opinion, photos and video',
		category: 'news',
		screenshot: { headed: true }
	},
	{
		id: 'yahoo-finance',
		name: 'Yahoo Finance',
		url: 'https://finance.yahoo.com/',
		description: 'Free stock quotes, up-to-date news, portfolio management resources',
		category: 'news'
	},
	{
		id: 'reuters',
		name: 'Reuters',
		url: 'https://www.reuters.com',
		description: 'Find the latest news from every corner of the globe',
		category: 'news',
		screenshot: { headed: true }
	},
	{
		id: 'radio-france',
		name: 'Radio France',
		url: 'https://www.radiofrance.fr/',
		description: 'Écoutez en ligne tous les programmes de Radio France',
		lang: 'fr',
		category: 'news'
	},
	{
		id: 'nrk',
		name: 'NRK',
		url: 'https://www.nrk.no/',
		// from https://www.nrk.no/about/this-is-nrk-1.2895065
		description: 'Norway’s major broadcasting institution',
		category: 'news'
	},
	{
		id: 'the-pudding',
		name: 'The Pudding',
		url: 'https://pudding.cool/',
		description: 'Explains ideas with visual essays',
		category: 'news'
	},
	{
		id: 'de-correspondent',
		name: 'De Correspondent',
		url: 'https://decorrespondent.nl/',
		// from https://decorrespondent.nl/about
		description: 'A journalism platform for independent voices',
		category: 'news',
		screenshot: { hide: ['#signup-zuiderdock'] }
	},
	{
		id: 'syntax',
		name: 'Syntax',
		url: 'https://syntax.fm/',
		description: 'Wes Bos and Scott Tolinski dive deep into web development',
		category: 'news'
	},

	{
		id: 'apple-music',
		name: 'Apple Music',
		url: 'https://music.apple.com/',
		// from https://support.apple.com/guide/music-web/welcome/web
		description: 'Listen on any device, wherever you are',
		category: 'entertainment',
		screenshot: { hide: ['.banner-container', '.upsell-banner'] }
	},
	{
		id: 'apple-tv',
		name: 'Apple TV',
		url: 'https://tv.apple.com/',
		description: 'Browse all movies, TV shows, and more',
		category: 'entertainment',
		// the name is at the bottom of the page, under the posters
		screenshot: { position: 'left bottom' }
	},
	{
		id: 'app-store',
		name: 'App Store',
		url: 'https://apps.apple.com/',
		// from https://www.apple.com/app-store/
		description: 'A safe and trusted place to discover apps',
		category: 'entertainment',
		screenshot: { hide: ['.banner-container'] }
	},
	{
		id: 'apple-podcasts',
		name: 'Apple Podcasts',
		url: 'https://podcasts.apple.com/',
		// from https://podcasters.apple.com/support/5462-apple-podcasts-available-on-the-web
		description: 'The full Apple Podcasts experience on any web browser, on any device',
		category: 'entertainment',
		screenshot: { hide: ['.banner-container'] }
	},
	{
		id: 'apple-music-100-best',
		name: '100 Best Albums',
		url: 'https://100best.music.apple.com/us',
		description: 'The greatest albums ever made',
		category: 'entertainment',
		screenshot: { hide: ['.banner-container', '.tooltip-container'] }
	},
	{
		id: 'spotify',
		name: 'Spotify Premium',
		url: 'https://www.spotify.com/us/premium/',
		description: 'Ad-free music listening',
		category: 'entertainment',
		screenshot: { hide: ['.mh-message-bar'] }
	},
	{
		id: 'viki',
		name: 'Rakuten Viki',
		url: 'https://www.viki.com/',
		description: 'Stream free Asian dramas & movies with English subtitles',
		category: 'entertainment'
	},
	{
		id: 'ripleys',
		name: 'Ripley’s Believe It or Not!',
		url: 'https://www.ripleys.com/',
		description: 'Aquariums and attractions',
		category: 'entertainment',
		screenshot: { hide: ['.bb-root'] }
	},
	{
		id: 'brawlhalla',
		name: 'Brawlhalla',
		url: 'https://www.brawlhalla.com/',
		description: 'Play with your friends on PlayStation, Xbox, PC, Nintendo Switch & mobile',
		category: 'entertainment',
		screenshot: { hide: ['#privacy_modal'] }
	},
	{
		id: 'guild-wars-3',
		name: 'Guild Wars 3',
		url: 'https://www.guildwars3.com/',
		description: 'An action-adventure MMORPG',
		category: 'entertainment',
		screenshot: { hide: ['.scrim'] }
	},
	{
		id: 'houses-of-the-world',
		name: 'Houses Of The World',
		url: 'https://housesof.world/',
		description: 'A project showcasing charismatic houses around the world',
		category: 'entertainment',
		screenshot: { hide: ['.toast'] }
	},

	{
		id: 'obama-foundation',
		name: 'Obama Foundation',
		url: 'https://www.obama.org/',
		description: 'Inspire, empower, and connect people to change their world',
		category: 'public',
		// the museum ticket notice
		screenshot: { hide: ['[aria-labelledby="banner-title"]'] }
	},
	{
		id: 'black-teacher-archive',
		name: 'Black Teacher Archive',
		url: 'https://bta.gse.harvard.edu/',
		description: 'A public digital archive of documents by and about Black teachers',
		category: 'public'
	},
	{
		id: 'ons-census-maps',
		name: 'Census maps',
		url: 'https://www.ons.gov.uk/census/maps/',
		description: 'An interactive tool to explore Census 2021 data across England and Wales',
		category: 'public'
	},
	{
		id: 'ons-local-statistics',
		name: 'Explore local statistics',
		url: 'https://www.ons.gov.uk/explore-local-statistics/',
		description: 'Find, compare and visualise statistics about communities in the United Kingdom',
		category: 'public'
	},
	{
		id: 'city-of-sydney',
		name: 'City of Sydney News',
		url: 'https://news.cityofsydney.nsw.gov.au/',
		description: 'The latest updates from the City of Sydney',
		category: 'public'
	},
	{
		id: 'mhclg-components',
		name: 'MHCLG Svelte Component Library',
		url: 'https://communitiesuk.github.io/mhclg_svelte_component_library/',
		description: 'Dynamic content, layout, UI, charts, maps and data visualisations',
		category: 'public'
	},

	{
		id: 'hugging-face',
		name: 'Hugging Face',
		url: 'https://huggingface.co/',
		description: 'The AI community building the future',
		category: 'ai'
	},
	{
		id: 'huggingchat',
		name: 'HuggingChat',
		url: 'https://huggingface.co/chat/',
		description: 'Making the community’s best AI chat models available to everyone',
		category: 'ai',
		screenshot: { hide: ['.fixed.inset-0.z-40'] }
	},
	{
		id: 'z-ai',
		name: 'Z.ai',
		url: 'https://chat.z.ai/',
		description: 'The AI assistant powered by GLM-5.3-Flash',
		category: 'ai',
		// a demo chat linked from https://z.ai/blog/glm-4.7
		screenshot: { url: 'https://chat.z.ai/s/83640645-5436-4069-a27b-f8094189d669' }
	},
	{
		id: 'modal',
		name: 'Modal',
		url: 'https://modal.com/',
		description: 'Cloud infrastructure for teams that develop, train, and serve AI applications',
		category: 'ai'
	},
	{
		id: 'open-webui',
		name: 'Open WebUI',
		url: 'https://openwebui.com/',
		description: 'Run AI on your own terms',
		category: 'ai',
		screenshot: { hide: ['.fixed.right-4.bottom-4'] }
	},
	{
		id: 'gradio',
		name: 'Gradio',
		url: 'https://www.gradio.app/',
		description: 'Build & share delightful machine learning apps',
		category: 'ai'
	},
	{
		id: 'llama',
		name: 'Llama',
		url: 'https://llama.app/',
		description: 'Run the latest open models on your computer',
		category: 'ai'
	},
	{
		id: 'anda',
		name: 'Anda',
		url: 'https://anda.ai/',
		description: 'Open protocols, infrastructure, and benchmarks for persistent machine cognition',
		category: 'ai'
	},

	{
		id: 'brave',
		name: 'Brave',
		url: 'https://brave.com/',
		description: 'A fast, private and secure web browser for PC, Mac and mobile',
		category: 'tools'
	},
	{
		id: 'windy',
		name: 'Windy',
		url: 'https://www.windy.com/',
		description: 'Weather radar, wind and waves forecast',
		category: 'tools',
		screenshot: { hide: ['#plugin-startup-articles'] }
	},
	{
		id: 'kagi',
		name: 'Kagi',
		url: 'https://kagi.com/',
		description: 'Better search results',
		category: 'tools',
		screenshot: { hide: ['.fsp-turnstile-layer'] }
	},
	{
		id: 'cobalt',
		name: 'cobalt',
		url: 'https://cobalt.tools/',
		description: 'Save what you love without ads, tracking, paywalls or other nonsense',
		category: 'tools'
	},
	{
		id: 'immich',
		name: 'Immich',
		url: 'https://immich.app/',
		description: 'Self-hosted photo and video management solution',
		category: 'tools'
	},
	{
		id: 'kumamap',
		name: 'Kumamap',
		url: 'https://kumamap.com/ja',
		// from https://kumamap.com/en
		description: 'Japan Bear Incident Map',
		category: 'tools'
	},
	{
		id: 'vert',
		name: 'VERT',
		url: 'https://vert.sh/',
		description: 'Quickly convert any image, video, audio, and document file',
		category: 'tools',
		screenshot: { hide: ['.fixed.bottom-28.right-0'] }
	},
	{
		id: 'harper',
		name: 'Harper',
		url: 'https://writewithharper.com/',
		description: 'The free, private, open-source grammar checker that runs on your device',
		category: 'tools'
	},
	{
		id: 'kimbia',
		name: 'Kimbia',
		url: 'https://kimbia.app/',
		description: 'Running, trail, cycling, hiking: one journal',
		category: 'tools',
		screenshot: { hide: ['.fixed.inset-x-0.bottom-0'] }
	},
	{
		id: 'pronauns',
		name: 'Pronauns',
		url: 'https://pronauns.com/',
		description: 'Improve your speaking by learning proper pronunciation',
		category: 'tools'
	},
	{
		id: 'pausly',
		name: 'Pausly',
		url: 'https://www.pausly.app/',
		description: 'Take a short break from your work to stretch',
		category: 'tools'
	},

	{
		id: 'stack-overflow-survey',
		name: 'Stack Overflow Developer Survey',
		url: 'https://survey.stackoverflow.co/',
		description: 'The largest survey of people who code',
		category: 'developers'
	},
	{
		id: 'stack-overflow',
		name: 'Stack Overflow',
		url: 'https://stackoverflow.com/questions',
		// from https://survey.stackoverflow.co/2025/
		description: 'Where developers and technologists go to gain and share knowledge',
		category: 'developers',
		screenshot: { headed: true }
	},
	{
		id: 'crates-io',
		name: 'crates.io',
		url: 'https://crates.io/',
		description:
			'A central registry for sharing crates, which are packages or libraries written in Rust',
		category: 'developers'
	},
	{
		id: 'datawrapper',
		name: 'Datawrapper',
		url: 'https://www.datawrapper.de/',
		description: 'Create interactive, responsive & beautiful data visualizations',
		category: 'developers'
	},
	{
		id: 'tangled',
		name: 'Tangled',
		url: 'https://tangled.org/',
		description: 'Your open, federated code forge for the next decade',
		category: 'developers'
	},
	{
		id: 'coolify',
		name: 'Coolify',
		url: 'https://coolify.io/',
		description: 'Open-source alternative to Heroku',
		category: 'developers'
	},
	{
		id: 'mermaid',
		name: 'Mermaid Live Editor',
		url: 'https://mermaid.live/',
		description: 'A simple markdown-like script language for generating charts from text',
		category: 'developers',
		screenshot: { hide: ['[role="dialog"]', '.fixed.inset-0.z-50', '[class*="bg-[#E0095F]"]'] }
	},
	{
		id: 'gitbutler',
		name: 'GitButler',
		url: 'https://gitbutler.com/',
		description: 'A Git CLI and desktop client built for humans and AI coding agents',
		category: 'developers'
	},
	{
		id: 'pocketbase',
		name: 'PocketBase',
		url: 'https://pocketbase.io/',
		description: 'Open source backend in 1 file',
		category: 'developers'
	},
	{
		id: 'evidence',
		name: 'Evidence',
		url: 'https://evidence.dev/',
		description: 'An open source, code-based alternative to drag-and-drop BI tools',
		category: 'developers'
	}
];
