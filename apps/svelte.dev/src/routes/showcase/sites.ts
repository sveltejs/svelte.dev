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
	/**
	 * as the site writes it, in its title, logo or main heading, unless a maintainer asked for a
	 * clearer one, such as the country for a government site
	 */
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
		/**
		 * the first frame of its clip, taken with pnpm showcase <id> --clip, for a site that shows something
		 * different on every visit, so the screenshot matches the clip that plays over it
		 */
		from_clip?: boolean;
		/** the object-position of the screenshot when cropped, left top by default like a browser window */
		position?: string;
		/** how far down the page to take, for one whose lower part only plays as it scrolls */
		height?: number;
	};
	/** a smaller site, shown after the categories rather than in its own */
	more?: true;
	/**
	 * a short recording that plays in place of the screenshot, for a site whose video, animation or
	 * hover effects a screenshot misses. taken with pnpm showcase <id> --clip
	 */
	clip?:
		| true
		| {
				/** css selector for a part of the page to record instead of the top, scrolled to the middle */
				scroll?: string;
				/** where the top of the part to record goes, in pixels from the top of the window */
				top?: number;
				/** css selector for things to move the pointer across in turn while recording */
				hover?: string;
				/**
				 * scrolls down the page and back while recording, for one that plays things as it
				 * scrolls, stopping at the top of a section about a screen down, or the first matching
				 * this playwright selector a way down, which can name it by its text with :has-text()
				 */
				travel?: boolean | string;
				/** moves the pointer round the window, while it travels if it does, for one that follows it */
				wander?: boolean;
				/** loads the page again while recording, for one that only plays as it loads */
				intro?: boolean;
				/** seconds to record, 8 by default */
				length?: number;
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
		category: 'brands',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},
	{
		id: 'ashley',
		name: 'Ashley',
		url: 'https://www.ashleyfurniture.com/',
		description: 'Home furniture and home decor online or in-store',
		category: 'brands',
		clip: true,
		screenshot: {
			headed: true,
			from_clip: true,
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
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['.group.fixed.bottom-3'], from_clip: true },
		clip: true
	},
	{
		id: 'dbrand',
		name: 'dbrand',
		url: 'https://dbrand.com/',
		description: 'The global leader in device customization',
		category: 'brands',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		// stopping where its customer count animates
		clip: { travel: 'section.wrapper:has-text("23 Million")' }
	},
	{
		id: 'mill',
		name: 'Mill',
		url: 'https://www.mill.com/',
		description: 'Turns would-be food waste into resources for the Earth',
		category: 'brands',
		// the screenshot is from its clip, which plays its top and stops at its steps
		screenshot: { hide: ['dialog'], from_clip: true },
		clip: { travel: '.how-it-works-slide-rail' }
	},
	{
		id: 'porters-paints',
		name: 'Porter’s Paints',
		url: 'https://shop.porterspaints.com/',
		description: 'Rich colour and texture in hand-made paints',
		category: 'brands',
		more: true,
		screenshot: { hide: ['#chat-widget-container'] }
	},
	{
		id: 'swehl',
		name: 'Swehl',
		url: 'https://swehl.com/',
		description: 'A one-stop-shop for your breastfeeding journey',
		category: 'brands',
		screenshot: { hide: ['.z-50:has(#popup)'] }
	},
	{
		id: 'chapitre',
		name: 'Chapitre Résidentiel',
		url: 'https://chapitreresidentiel.com/en',
		description: 'Your new home, connected to what matters',
		category: 'brands',
		// from its clip, which shows its animation
		screenshot: { from_clip: true },
		clip: true
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
		id: 'square',
		name: 'Square',
		url: 'https://squareup.com/us/en',
		description: 'Power your entire business',
		category: 'business',
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['#salesbot-popup-container'], from_clip: true },
		clip: true
	},
	{
		id: 'michelin',
		name: 'Michelin',
		url: 'https://www.michelin.com/en/',
		description: 'World’s leading manufacturer of life-changing composites and experiences',
		category: 'business',
		screenshot: { headed: true, from_clip: true },
		clip: true
	},
	{
		id: 'block',
		name: 'Block',
		url: 'https://block.xyz/',
		description: 'Made up of Square, Cash App, Afterpay, TIDAL, Bitkey, and Proto',
		category: 'business',
		// from its clip, which starts at the footer where the animations play
		screenshot: { from_clip: true },
		clip: {
			// each of its companies plays a short animation as you point at its name
			scroll: 'footer',
			hover: 'footer nav a[role="menuitem"]'
		}
	},
	{
		id: 'beyonk',
		name: 'Beyonk',
		url: 'https://beyonk.com/',
		description: 'Online event ticketing system and ticket booking software',
		category: 'business',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},
	{
		id: 'trading-strategy',
		name: 'Trading Strategy',
		url: 'https://tradingstrategy.ai/',
		description: 'Compare 3,000+ DeFi vaults by yield, TVL, risk and fees',
		category: 'business',
		more: true
	},
	{
		id: 'zenos',
		name: 'Zenos',
		url: 'https://www.zenos.com/',
		description: 'Robotics for industrial and construction productivity',
		category: 'business',
		// from its clip, so it matches where the particles start
		screenshot: { from_clip: true },
		// its heading writes itself in as the page loads
		clip: { intro: true, length: 6 }
	},
	{
		id: 'modulus',
		name: 'Modulus',
		url: 'https://modulus.vision/',
		description: 'Design, web development and consulting',
		category: 'business',
		// the screenshot is from its clip, which plays its animation as it scrolls
		screenshot: { hide: ['.cookieConsentWrapper'], from_clip: true },
		clip: { travel: true }
	},
	{
		id: 'montoni',
		name: 'Groupe Montoni',
		url: 'https://groupemontoni.com/',
		description: 'Pioneer of sustainable buildings in Canada',
		category: 'business',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},
	{
		id: 'gestisoft',
		name: 'Gestisoft',
		url: 'https://www.gestisoft.com/en',
		description: 'Your ERP & CRM partner',
		category: 'business',
		more: true,
		// without the banner across the top, and from its clip, so the two match
		screenshot: { hide: ['._site-banner'], from_clip: true },
		clip: { travel: true }
	},
	{
		id: 'merlin',
		name: 'Merlin',
		url: 'https://merlin.studio/',
		description: 'Boutique Digital Studio creating lasting connection',
		category: 'business',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: { wander: true }
	},
	{
		id: 'akis',
		name: 'AKIS',
		url: 'https://akis.studio/',
		description: 'Web and branding agency in Brussels',
		category: 'business',
		// the animation behind the heading only plays without reduced motion, which screenshots use
		screenshot: { from_clip: true },
		clip: { travel: true, wander: true }
	},

	// TODO retake these three once the news is quieter, their front pages lead with the 2026
	// midterms, pnpm showcase --headed nytimes yahoo-finance reuters
	{
		id: 'nytimes',
		name: 'The New York Times',
		url: 'https://www.nytimes.com/',
		description: 'Live news, investigations, opinion, photos and video',
		category: 'news',
		// the window alone, so taking it never scrolls a site that is quick to block automation
		screenshot: { headed: true, height: 900 }
	},
	{
		id: 'yahoo-finance',
		name: 'Yahoo Finance',
		url: 'https://finance.yahoo.com/',
		description: 'Free stock quotes, up-to-date news, portfolio management resources',
		category: 'news',
		// the screenshot is from its clip, which plays its video, but only in a window you can see
		screenshot: { headed: true, from_clip: true },
		clip: true
	},
	{
		id: 'reuters',
		name: 'Reuters',
		url: 'https://www.reuters.com',
		description: 'Find the latest news from every corner of the globe',
		category: 'news',
		screenshot: { headed: true },
		clip: true
	},
	{
		id: 'radio-france',
		name: 'Radio France',
		url: 'https://www.radiofrance.fr/',
		description: 'Listen to live and on-demand radio, original podcasts, and music',
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
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { hide: ['.banner-container', '.upsell-banner'], height: 900 }
	},
	{
		id: 'apple-tv',
		name: 'Apple TV',
		url: 'https://tv.apple.com/',
		description: 'Browse all movies, TV shows, and more',
		category: 'entertainment',
		// a different trailer and layout on each visit, which reduced motion skips to posters
		screenshot: { from_clip: true },
		clip: true
	},
	{
		id: 'app-store',
		name: 'Apple App Store',
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
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { hide: ['.banner-container'], height: 900 }
	},
	{
		id: 'spotify',
		name: 'Spotify Premium',
		url: 'https://www.spotify.com/us/premium/',
		description: 'Ad-free music listening',
		category: 'entertainment',
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['.mh-message-bar'], from_clip: true },
		clip: true
	},
	{
		id: 'viki',
		name: 'Rakuten Viki',
		url: 'https://www.viki.com/',
		description: 'Stream free Asian dramas & movies with English subtitles',
		category: 'entertainment',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},
	{
		id: 'ripleys',
		name: 'Ripley’s Believe It or Not!',
		url: 'https://www.ripleys.com/',
		description: 'Aquariums and attractions',
		category: 'entertainment',
		// the header grows into a video filling the window as the page scrolls
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['.bb-root'], height: 900, from_clip: true },
		clip: true
	},
	{
		id: 'brawlhalla',
		name: 'Brawlhalla',
		url: 'https://www.brawlhalla.com/',
		description: 'Play with your friends on PlayStation, Xbox, PC, Nintendo Switch & mobile',
		category: 'entertainment',
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['#privacy_modal'], from_clip: true },
		clip: { travel: '#welcome-to-brawlhalla' }
	},
	{
		id: 'guild-wars-3',
		name: 'Guild Wars 3',
		url: 'https://www.guildwars3.com/',
		description: 'An action-adventure MMORPG',
		category: 'entertainment',
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['.scrim'], from_clip: true },
		clip: true
	},
	{
		id: 'houses-of-the-world',
		name: 'Houses Of The World',
		url: 'https://housesof.world/',
		description: 'A project showcasing charismatic houses around the world',
		category: 'entertainment',
		more: true,
		screenshot: { hide: ['.toast'] }
	},
	{
		id: 'apple-music-100-best',
		name: '100 Best Albums',
		url: 'https://100best.music.apple.com/us',
		description: 'The greatest albums ever made',
		category: 'entertainment',
		more: true,
		screenshot: { hide: ['.banner-container', '.tooltip-container'], from_clip: true },
		clip: true
	},
	{
		id: 'allfeat',
		name: 'Allfeat',
		url: 'https://allfeat.org/',
		description: 'Control all your music IPs in one place',
		category: 'entertainment'
	},

	{
		id: 'obama-foundation',
		name: 'Obama Foundation',
		url: 'https://www.obama.org/',
		description: 'Inspire, empower, and connect people to change their world',
		category: 'public',
		// the museum ticket notice
		// the screenshot is from its clip, so the two match
		screenshot: { hide: ['[aria-labelledby="banner-title"]'], from_clip: true },
		clip: true
	},
	{
		id: 'black-teacher-archive',
		// renamed at a maintainer's request; the site calls itself the Black Teacher Archive
		name: 'Harvard’s Black Teacher Archive',
		url: 'https://bta.gse.harvard.edu/',
		description: 'A public digital archive of documents by and about Black teachers',
		category: 'public'
	},
	{
		id: 'ons-census-maps',
		name: 'UK Census Maps',
		url: 'https://www.ons.gov.uk/census/maps/',
		description: 'An interactive tool to explore Census 2021 data across England and Wales',
		category: 'public',
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { height: 900 }
	},
	{
		id: 'ons-local-statistics',
		name: 'UK Local Statistics',
		url: 'https://www.ons.gov.uk/explore-local-statistics/',
		description: 'Find, compare and visualise statistics about communities in the United Kingdom',
		category: 'public',
		// the window alone, since the rest of the page is only links
		screenshot: { height: 900 }
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
		name: 'GOV.UK Svelte Components',
		url: 'https://communitiesuk.github.io/mhclg_svelte_component_library/',
		description: 'Dynamic content, layout, UI, charts, maps and data visualisations',
		category: 'public',
		// the window alone, since the rest of the page adds little
		screenshot: { height: 900 }
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
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { hide: ['.fixed.inset-0.z-40'], height: 900 }
	},
	{
		id: 'z-ai',
		name: 'Z.ai',
		url: 'https://chat.z.ai/',
		description: 'The AI assistant powered by GLM-5.3-Flash',
		category: 'ai',
		// a demo chat linked from https://z.ai/blog/glm-4.7
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { url: 'https://chat.z.ai/s/83640645-5436-4069-a27b-f8094189d669', height: 900 }
	},
	{
		id: 'modal',
		name: 'Modal',
		url: 'https://modal.com/',
		description: 'Cloud infrastructure for teams that develop, train, and serve AI applications',
		category: 'ai',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: { travel: true }
	},
	{
		id: 'open-webui',
		name: 'Open WebUI',
		url: 'https://openwebui.com/',
		description: 'Run AI on your own terms',
		category: 'ai',
		screenshot: { hide: ['.fixed.right-4.bottom-4'], from_clip: true },
		clip: true
	},
	{
		id: 'gradio',
		name: 'Gradio',
		url: 'https://www.gradio.app/',
		description: 'Build & share delightful machine learning apps',
		category: 'ai',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},
	{
		id: 'llama',
		name: 'Llama',
		url: 'https://llama.app/',
		description: 'Run the latest open models on your computer',
		category: 'ai',
		more: true
	},
	{
		id: 'anda',
		name: 'Anda',
		url: 'https://anda.ai/',
		description: 'Open protocols, infrastructure, and benchmarks for persistent machine cognition',
		category: 'ai',
		more: true,
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: { travel: true }
	},
	{
		id: 'poolside',
		name: 'Poolside',
		url: 'https://poolside.ai/',
		description: 'Frontier research to operational intelligence',
		category: 'ai',
		more: true,
		// the window alone, since the rest of the page adds little, from its clip so the two match
		screenshot: { height: 900, from_clip: true },
		clip: true
	},
	{
		id: 'halfspace',
		name: 'Halfspace',
		url: 'https://halfspace.ai/',
		description:
			'Moving Organisations Forward Through Artificial Intelligence and Advanced Analytics',
		category: 'ai',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},

	{
		id: 'brave',
		name: 'Brave',
		url: 'https://brave.com/',
		description: 'A fast, private and secure web browser for PC, Mac and mobile',
		category: 'tools',
		// each illustration takes a few seconds to play
		// from its clip, so the two match
		screenshot: { from_clip: true },
		// from its heading, just under the bar across the top
		clip: {
			scroll: 'h2:has-text("user-first Web")',
			top: 160,
			hover: 'details.card summary',
			length: 16
		}
	},
	{
		id: 'windy',
		name: 'Windy',
		url: 'https://www.windy.com/',
		description: 'Weather radar, wind and waves forecast',
		category: 'tools',
		// the window alone, which the app fills, so the whole of it shows at once, from its clip of
		// the wind moving over the map, so the two match
		screenshot: {
			// over the north atlantic rather than wherever it is taken from, without the search and
			// forecast for that place
			url: 'https://www.windy.com/?35.000,-40.000,4',
			// and the notice that it is offline, which the ad blocker makes it think
			hide: ['#plugin-startup-articles', '#window-top-message', '#search'],
			height: 900,
			from_clip: true
		},
		clip: true
	},
	{
		id: 'kagi',
		name: 'Kagi',
		url: 'https://kagi.com/',
		description: 'Better search results',
		category: 'tools',
		// the window alone, since the rest of the page adds little
		screenshot: { hide: ['.fsp-turnstile-layer'], height: 900 }
	},
	{
		id: 'cobalt',
		name: 'cobalt',
		url: 'https://cobalt.tools/',
		description: 'Save what you love without ads, tracking, paywalls or other nonsense',
		category: 'tools',
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { height: 900 }
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
		category: 'tools',
		more: true
	},
	{
		id: 'vert',
		name: 'VERT',
		url: 'https://vert.sh/',
		description: 'Quickly convert any image, video, audio, and document file',
		category: 'tools',
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: { hide: ['.fixed.bottom-28.right-0'], height: 900 }
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
		// further down than most, since the page goes on showing the app
		screenshot: { hide: ['.fixed.inset-x-0.bottom-0'], height: 4800 }
	},
	{
		id: 'pronauns',
		name: 'Pronauns',
		url: 'https://pronauns.com/',
		description: 'Improve your speaking by learning proper pronunciation',
		category: 'tools',
		more: true
	},
	{
		id: 'pausly',
		name: 'Pausly',
		url: 'https://www.pausly.app/',
		description: 'Take a short break from your work to stretch',
		category: 'tools',
		more: true
	},
	{
		id: 'onewhale',
		name: 'OneWhale',
		url: 'https://onewhale.io/',
		description: 'Self-custody wallet built for real usage',
		category: 'tools',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: true
	},

	{
		id: 'stack-overflow-survey',
		name: 'Stack Overflow Developer Survey',
		url: 'https://survey.stackoverflow.co/',
		description: 'The largest survey of people who code',
		category: 'developers',
		// the window alone, since the rest of the page adds little
		screenshot: { height: 900 }
	},
	{
		id: 'stack-overflow',
		name: 'Stack Overflow',
		url: 'https://stackoverflow.com/questions',
		// from https://survey.stackoverflow.co/2025/
		description: 'Where developers and technologists go to gain and share knowledge',
		category: 'developers',
		// the window alone, since the rest of the page adds little
		screenshot: { headed: true, height: 900 }
	},
	{
		id: 'crates-io',
		name: 'crates.io',
		url: 'https://crates.io/',
		description:
			'A central registry for sharing crates, which are packages or libraries written in Rust',
		category: 'developers',
		// the window alone, since the rest of the page adds little
		screenshot: { height: 900 }
	},
	{
		id: 'datawrapper',
		name: 'Datawrapper',
		url: 'https://www.datawrapper.de/',
		description: 'Create interactive, responsive & beautiful data visualizations',
		category: 'developers',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		clip: { scroll: '.editor-carousel', hover: '.editor-carousel__tab' }
	},
	{
		id: 'tangled',
		name: 'Tangled',
		url: 'https://tangled.org/',
		description: 'Your open, federated code forge for the next decade',
		category: 'developers',
		// further down than most, since the page goes on showing the app
		screenshot: { height: 4800 }
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
		// the window alone, which the app fills, so the whole of it shows at once
		screenshot: {
			hide: ['[role="dialog"]', '.fixed.inset-0.z-50', '[class*="bg-[#E0095F]"]'],
			height: 900
		}
	},
	{
		id: 'gitbutler',
		name: 'GitButler',
		url: 'https://gitbutler.com/',
		description: 'A Git CLI and desktop client built for humans and AI coding agents',
		category: 'developers',
		// from its clip, so the two match
		screenshot: { from_clip: true },
		// from the top down to the agent setup typing itself out, and back
		clip: { travel: '.script-switcher', length: 12 }
	},
	{
		id: 'evidence',
		name: 'Evidence',
		url: 'https://evidence.dev/',
		description: 'An open source, code-based alternative to drag-and-drop BI tools',
		category: 'developers',
		more: true
	}
];
