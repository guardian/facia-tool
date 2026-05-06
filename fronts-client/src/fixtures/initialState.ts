import { Config } from 'types/Config';
import type { State } from 'types/State';

const fronts = {
	frontsConfig: {
		data: {
			fronts: {
				'sc-johnson-partner-zone': {
					collections: [
						'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
						'4ab657ff-c105-4292-af23-cda00457b6b7',
						'c7f48719-6cbc-4024-ae92-1b5f9f6c0c99',
					],
					priority: 'commercial',
					canonical: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
					group: 'US professional',
					id: 'sc-johnson-partner-zone',
					index: 0,
				},
				'a-shot-of-sustainability': {
					collections: [
						'bf2267c3-93a3-405c-8381-672fcb0e0b86',
						'7902d549-b02a-49b7-828b-c959d4b6f5db',
						'e4e9d1f0-542b-4df2-bbc4-6ac0532396bb',
						'e307d948-c6d5-4a2e-b0f4-3fdef9d8655c',
					],
					priority: 'commercial',
					canonical: 'e4e9d1f0-542b-4df2-bbc4-6ac0532396bb',
					group: 'UK consumer',
					id: 'a-shot-of-sustainability',
					index: 1,
				},
				'sustainable-business/fairtrade-partner-zone': {
					collections: [
						'341974f3-aff8-42bf-b2d2-fb789b450d57',
						'44b4cefc-cca4-4019-8aa2-df424d0307ab',
						'5dfd1f1a-4442-436a-a5aa-83486d78f905',
						'8df68e59-e7ef-40e5-bcf3-4ea3eb30950c',
						'ab21e2b6-93cb-4140-ac09-97c382dcaeb2',
						'6851252b-5b53-4089-886d-47e2e32a8a2d',
						'd5a943c6-ce77-4ffa-a9ab-3c9e736cc611',
					],
					priority: 'commercial',
					id: 'sustainable-business/fairtrade-partner-zone',
					index: 2,
				},
				'un-global-compact-partner-zone': {
					collections: ['082d2dc8-f196-4c00-979e-7f541f2772f4'],
					priority: 'commercial',
					canonical: '082d2dc8-f196-4c00-979e-7f541f2772f4',
					id: 'un-global-compact-partner-zone',
					index: 3,
				},
				'gnm-archive': {
					collections: [
						'dc14dd30-da03-4d42-8e96-0a7243a4274e',
						'28d44c92-0666-48d3-8f3b-ed3806455af6',
						'51e1da7b-84b1-4274-84e1-4aa368bf893a',
						'effe55e6-1a11-4c39-be17-d245f776ba4c',
						'7a35f3e8-3fab-4b2a-bc2f-7649f8342b56',
					],
					id: 'gnm-archive',
					priority: 'editorial',
					index: 4,
				},
			},
			collections: {
				'28d44c92-0666-48d3-8f3b-ed3806455af6': {
					displayName: 'pictures and video',
					backfill: {
						type: 'capi',
						query: 'search?tag=gnm-archive/gnm-archive,type/gallery',
					},
					type: 'flexible/general',
					href: 'gnm-archive/gnm-archive+type/gallery',
					id: '28d44c92-0666-48d3-8f3b-ed3806455af6',
				},
				'7a35f3e8-3fab-4b2a-bc2f-7649f8342b56': {
					displayName: 'other Guardian sites',
					type: 'nav/list',
					id: '7a35f3e8-3fab-4b2a-bc2f-7649f8342b56',
				},
				'5dfd1f1a-4442-436a-a5aa-83486d78f905': {
					displayName: 'interactive',
					type: 'flexible/general',
					id: '5dfd1f1a-4442-436a-a5aa-83486d78f905',
				},
				'e59785e9-ba82-48d8-b79a-0a80b2f9f808': {
					displayName: 'sc johnson partner zone',
					type: 'flexible/general',
					id: 'e59785e9-ba82-48d8-b79a-0a80b2f9f808',
				},
				'effe55e6-1a11-4c39-be17-d245f776ba4c': {
					displayName: 'the collections',
					type: 'static/medium/4',
					id: 'effe55e6-1a11-4c39-be17-d245f776ba4c',
				},
				'e307d948-c6d5-4a2e-b0f4-3fdef9d8655c': {
					displayName: 'discover Nespresso',
					backfill: { type: 'capi', query: 'discover-nespresso' },
					type: 'static/medium/4',
					href: 'discover-nespresso',
					id: 'e307d948-c6d5-4a2e-b0f4-3fdef9d8655c',
				},
				'082d2dc8-f196-4c00-979e-7f541f2772f4': {
					displayName: 'UN Global Compact partner zone',
					type: 'flexible/general',
					id: '082d2dc8-f196-4c00-979e-7f541f2772f4',
				},
				'7902d549-b02a-49b7-828b-c959d4b6f5db': {
					displayName: 'interactive.',
					type: 'flexible/general',
					id: '7902d549-b02a-49b7-828b-c959d4b6f5db',
				},
				'341974f3-aff8-42bf-b2d2-fb789b450d57': {
					displayName: 'fairtrade foundation partner zone',
					type: 'flexible/general',
					id: '341974f3-aff8-42bf-b2d2-fb789b450d57',
				},
				'e4e9d1f0-542b-4df2-bbc4-6ac0532396bb': {
					displayName: 'a shot of sustainability',
					backfill: {
						type: 'capi',
						query: 'search?section=a-shot-of-sustainability',
					},
					type: 'flexible/general',
					href: 'a-shot-of-sustainability',
					id: 'e4e9d1f0-542b-4df2-bbc4-6ac0532396bb',
				},
				'8df68e59-e7ef-40e5-bcf3-4ea3eb30950c': {
					displayName: 'commodities',
					type: 'flexible/general',
					id: '8df68e59-e7ef-40e5-bcf3-4ea3eb30950c',
				},
				'51e1da7b-84b1-4274-84e1-4aa368bf893a': {
					displayName: 'the big picture',
					type: 'flexible/general',
					id: '51e1da7b-84b1-4274-84e1-4aa368bf893a',
				},
				'4ab657ff-c105-4292-af23-cda00457b6b7': {
					displayName: 'popular in sustainable business',
					backfill: {
						type: 'capi',
						query:
							'sustainable-business/sustainable-business?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true',
					},
					type: 'news/most-popular',
					href: 'sustainable-business/sustainable-business',
					id: '4ab657ff-c105-4292-af23-cda00457b6b7',
				},
				'6851252b-5b53-4089-886d-47e2e32a8a2d': {
					displayName: 'get involved',
					type: 'flexible/general',
					id: '6851252b-5b53-4089-886d-47e2e32a8a2d',
				},
				'dc14dd30-da03-4d42-8e96-0a7243a4274e': {
					displayName: 'the archive',
					type: 'flexible/general',
					id: 'dc14dd30-da03-4d42-8e96-0a7243a4274e',
				},
				'c7f48719-6cbc-4024-ae92-1b5f9f6c0c99': {
					displayName: 'values-led business hub',
					backfill: {
						type: 'capi',
						query:
							'search?tag=sustainable-business/series/values-business&use-date=published',
					},
					type: 'static/medium/4',
					href: 'sustainable-business/series/values-business',
					id: 'c7f48719-6cbc-4024-ae92-1b5f9f6c0c99',
				},
				'd5a943c6-ce77-4ffa-a9ab-3c9e736cc611': {
					displayName: 'more from fairtrade foundation',
					type: 'static/medium/4',
					id: 'd5a943c6-ce77-4ffa-a9ab-3c9e736cc611',
				},
				'bf2267c3-93a3-405c-8381-672fcb0e0b86': {
					displayName: 'Important news 2',
					type: 'flexible/general',
					id: 'bf2267c3-93a3-405c-8381-672fcb0e0b86',
				},
				'ab21e2b6-93cb-4140-ac09-97c382dcaeb2': {
					displayName: 'business supply chains',
					type: 'flexible/general',
					id: 'ab21e2b6-93cb-4140-ac09-97c382dcaeb2',
				},
				'44b4cefc-cca4-4019-8aa2-df424d0307ab': {
					displayName: 'smallholder farmers',
					type: 'flexible/general',
					id: '44b4cefc-cca4-4019-8aa2-df424d0307ab',
				},
			},
		},
		pagination: null,
		lastError: null,
		error: null,
		lastSuccessfulFetchTimestamp: 1547474511048,
		loading: false,
		loadingIds: [],
		updatingIds: [],
	},
	lastPressed: {},
	collectionVisibility: { draft: {}, live: {} },
};
const config: Config = {
	dev: true,
	env: 'code',
	editions: ['uk', 'us', 'au'],
	email: 'jonathon.herbert@guardian.co.uk',
	avatarUrl:
		'https://lh4.googleusercontent.com/-XsUf7pwnZ_k/AAAAAAAAAAI/AAAAAAAAAAA/AKxrwcbJGKNqozZjexFlptsFL7TmT02Byw/mo/photo.jpg',
	firstName: 'Jonathon',
	lastName: 'Herbert',
	sentryPublicDSN:
		'https://4527e03d554a4962ae99a7481e9278ff@app.getsentry.com/35467',
	switches: {
		'facia-tool-allow-breaking-news-for-all': false,
		'facia-tool-permissions-access': true,
		'facia-tool-allow-edit-editorial-fronts-for-all': false,
		'facia-tool-allow-config-for-all': false,
		'facia-tool-allow-launch-editorial-fronts-for-all': false,
		'facia-tool-allow-launch-commercial-fronts-for-all': false,
		'facia-tool-sparklines': true,
		'facia-tool-draft-content': true,
		'facia-tool-disable': false,
	},
	acl: {
		fronts: { 'breaking-news': true },
		editions: { 'edit-editions': true },
		permissions: { 'configure-config': true },
	},
	collectionCap: 20,
	navListCap: 40,
	navListType: 'nav/list',
	collectionMetadata: [
		{ type: 'Canonical' },
		{ type: 'Special' },
		{ type: 'Breaking' },
		{ type: 'Branded' },
	],
	userData: {
		clipboardArticles: [
			{
				id: 'internal-code/page/5592826',
				frontPublicationDate: 1547204861924,
				meta: {},
			},
		],
		frontIds: [],
		frontIdsByPriority: {},
		favouriteFrontIdsByPriority: {},
		featureSwitches: [],
	},
	capiLiveUrl: 'https://fronts.local.dev-gutools.co.uk/api/live/',
	capiPreviewUrl: 'https://fronts.local.dev-gutools.co.uk/api/preview/',
	availableTerritories: [],
	availableTemplates: [],
	telemetryUrl: '',
	baseUrls: {
		mediaBaseUrl: 'https://media.gutools.co.uk',
		apiBaseUrl: 'https://api.media.test.dev-gutools.co.uk',
		videoBaseUrl: 'https://video.code.dev-gutools.co.uk',
	},
};

const externalArticles: State['externalArticles'] = {
	data: {
		'internal-code/page/5592826': {
			id: 'internal-code/page/5592826',
			type: 'video',
			sectionId: 'media',
			sectionName: 'Media',
			webPublicationDate: '2019-01-11T11:06:58Z',
			webTitle: 'Fiona Bruce makes debut as Question Time host – video',
			webUrl:
				'https://www.theguardian.com/media/video/2019/jan/11/fiona-bruce-makes-debut-as-question-time-host-video',
			fields: {
				headline: 'Fiona Bruce makes debut as Question Time host – video',
				byline: '',
				firstPublicationDate: '2019-01-11T11:06:58Z',
				internalPageCode: '5592826',
				shortUrl: 'https://gu.com/p/ae3zj',
				thumbnail:
					'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/109_80_814_488/500.jpg',
				isLive: 'true',
			},
			tags: [
				{
					id: 'media/fiona-bruce',
					type: 'keyword',
					sectionId: 'media',
					sectionName: 'Media',
					webTitle: 'Fiona Bruce',
					webUrl: 'https://www.theguardian.com/media/fiona-bruce',
				},
				{
					id: 'media/bbc',
					type: 'keyword',
					sectionId: 'media',
					sectionName: 'Media',
					webTitle: 'BBC',
					webUrl: 'https://www.theguardian.com/media/bbc',
				},
				{
					id: 'tone/news',
					type: 'tone',
					webTitle: 'News',
					webUrl: 'https://www.theguardian.com/tone/news',
				},
				{
					id: 'media/media',
					type: 'keyword',
					sectionId: 'media',
					sectionName: 'Media',
					webTitle: 'Media',
					webUrl: 'https://www.theguardian.com/media/media',
				},
				{
					id: 'tv-and-radio/question-time',
					type: 'keyword',
					sectionId: 'tv-and-radio',
					sectionName: 'Television & radio',
					webTitle: 'Question Time',
					webUrl: 'https://www.theguardian.com/tv-and-radio/question-time',
				},
				{
					id: 'politics/politics',
					type: 'keyword',
					sectionId: 'politics',
					sectionName: 'Politics',
					webTitle: 'Politics',
					webUrl: 'https://www.theguardian.com/politics/politics',
				},
				{
					id: 'culture/culture',
					type: 'keyword',
					sectionId: 'culture',
					sectionName: 'Culture',
					webTitle: 'Culture',
					webUrl: 'https://www.theguardian.com/culture/culture',
				},
				{
					id: 'type/video',
					type: 'type',
					webTitle: 'Video',
					webUrl: 'https://www.theguardian.com/video',
				},
				{
					id: 'tracking/commissioningdesk/uk-video',
					type: 'tracking',
					webTitle: 'UK Video',
					webUrl:
						'https://www.theguardian.com/tracking/commissioningdesk/uk-video',
				},
			],
			elements: [],
			blocks: {
				main: {
					id: '5c38752ee4b0cebe761842fa',
					bodyHtml:
						'<figure class="element element-atom"> <gu-atom data-atom-id="4b651e39-3d5d-46c3-b10b-05bd77f89673"         data-atom-type="media"    > </gu-atom> </figure>',
					bodyTextSummary: '',
					attributes: [],
					published: false,
					createdDate: '2019-01-11T10:51:26Z',
					lastModifiedDate: '2019-01-11T11:11:07Z',
					contributors: [],
					createdBy: {
						email: 'tola.onanuga.casual@guardian.co.uk',
						firstName: 'Tola',
						lastName: 'Onanuga',
					},
					lastModifiedBy: {
						email: 'gary.marshall.casual@guardian.co.uk',
						firstName: 'Gary',
						lastName: 'Marshall',
					},
					elements: [
						{
							type: 'contentatom',
							id: 'foo',
							relation: 'main',
							assets: [],
							contentAtomTypeData: {
								atomId: '4b651e39-3d5d-46c3-b10b-05bd77f89673',
								atomType: 'media',
							},
						},
					],
				},
			},
			atoms: {
				media: [
					{
						id: '4b651e39-3d5d-46c3-b10b-05bd77f89673',
						atomType: 'media',
						data: {
							media: {
								assets: [
									{
										assetType: 'video',
										version: 1,
										id: 'bGnEcyxZIOM',
										platform: 'youtube',
									},
								],
								activeVersion: 1,
								posterImage: {
									assets: [
										{
											type: 'image',
											mimeType: 'image/jpeg',
											file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/125_60_851_479/500.jpg',
											typeData: {},
											dimensions: { height: 281, width: 500 },
										},
										{
											type: 'image',
											mimeType: 'image/jpeg',
											file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/125_60_851_479/140.jpg',
											typeData: {},
											dimensions: { height: 79, width: 140 },
										},
										{
											type: 'image',
											mimeType: 'image/jpeg',
											file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/125_60_851_479/851.jpg',
											typeData: {},
											dimensions: { height: 479, width: 851 },
										},
									],
									master: {
										type: 'image',
										mimeType: 'image/jpeg',
										file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/125_60_851_479/master/851.jpg',
										typeData: {},
										dimensions: { height: 479, width: 851 },
									},
								},
								trailImage: {
									assets: [
										{
											type: 'image',
											mimeType: 'image/jpeg',
											file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/109_80_814_488/500.jpg',
											typeData: {},
											dimensions: { height: 300, width: 500 },
										},
										{
											type: 'image',
											mimeType: 'image/jpeg',
											file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/109_80_814_488/140.jpg',
											typeData: {},
											dimensions: { height: 84, width: 140 },
										},
										{
											type: 'image',
											mimeType: 'image/jpeg',
											file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/109_80_814_488/814.jpg',
											typeData: {},
											dimensions: { height: 488, width: 814 },
										},
									],
									master: {
										type: 'image',
										mimeType: 'image/jpeg',
										file: 'https://media.guim.co.uk/d38bca368b0fa22d1a47923ac05fb4c6d20005a1/109_80_814_488/master/814.jpg',
										typeData: {},
										dimensions: { height: 488, width: 814 },
									},
								},
							},
						},
					},
				],
			},
			isHosted: false,
			pillarId: 'pillar/news',
			pillarName: 'News',
			frontsMeta: {
				defaults: {
					isBreaking: false,
					isBoosted: false,
					showMainVideo: true,
					imageHide: false,
					showKickerCustom: false,
					showByline: false,
					showQuotedHeadline: false,
					imageSlideshowReplace: false,
					showKickerTag: false,
					showLivePlayable: false,
					imageReplace: false,
					imageCutoutReplace: false,
					showKickerSection: false,
					showLargeHeadline: false,
				},
				tone: 'media',
			},
			urlPath:
				'media/video/2019/jan/11/fiona-bruce-makes-debut-as-question-time-host-video',
		},
	},
	pagination: null,
	lastError: null,
	error: null,
	lastSuccessfulFetchTimestamp: 1547474510279,
	loadingIds: [],
	updatingIds: [],
};

const emptyFeedBundle = {
	data: {},
	pagination: null,
	lastError: null,
	error: null,
	lastSuccessfulFetchTimestamp: 1547474573228,
	loading: false,
	loadingIds: [],
	updatingIds: [],
};

const state = {
	optionsModal: null,
	fronts,
	config,
	error: '',
	path: '/v2/editorial',
	unpublishedChanges: {},
	clipboard: ['56a3b407-741c-439f-a678-175abea44a9f'],
	editor: {
		showOpenFrontsMenu: false,
		frontIds: [],
		frontIdsByPriority: {},
		favouriteFrontIdsByPriority: {},
		collectionIds: [],
		selectedCards: {},
		closedOverviews: [],
		clipboardOpen: true,
		frontIdsByBrowsingStage: {},
		editingMetadataFrontIds: [],
	},
	staleFronts: {},
	form: {},
	feed: {
		feedState: {
			isPrefillMode: false,
		},
		capiLiveFeed: emptyFeedBundle,
		capiPreviewFeed: emptyFeedBundle,
		prefillFeed: emptyFeedBundle,
	},
	focus: { focusState: undefined },
	editionsIssue: {
		data: undefined,
		pagination: null,
		lastError: null,
		error: null,
		lastSuccessfulFetchTimestamp: 1547474573363,
		loading: false,
		loadingIds: [],
		updatingIds: [],
	},
	featureSwitches: {},
	pageViewData: {},
	externalArticles,
	cards: {
		'56a3b407-741c-439f-a678-175abea44a9f': {
			id: 'internal-code/page/5592826',
			frontPublicationDate: 1547204861924,
			meta: { supporting: [] },
			uuid: '56a3b407-741c-439f-a678-175abea44a9f',
		},
		exampleId: {
			id: 'internal-code/page/5592826',
			frontPublicationDate: 1547204861924,
			meta: { headline: 'Bill Shorten', supporting: [] },
			uuid: 'exampleId',
		},
	},
	groups: {
		group123: {
			id: 'gobbleygook',
			name: 'groupname',
			uuid: 'group123',
			cards: ['56a3b407-741c-439f-a678-175abea44a9f'],
		},
	},
	collections: {
		data: {
			'e59785e9-ba82-48d8-b79a-0a80b2f9f808': {
				live: ['group123'],
				lastUpdated: 1547202598354,
				updatedBy: 'Name Surname',
				updatedEmail: 'email@email.co.uk',
				displayName: 'headlines',
				id: '5a32abdf-2d1c-4f9e-a116-617e4d055ab9',
				type: 'static/medium/4',
			},
		},
		pagination: null,
		lastError: null,
		error: null,
		lastSuccessfulFetchTimestamp: null,
		loading: false,
		loadingIds: [],
		updatingIds: [],
	},
	notifications: { banners: [] },
	chefs: emptyFeedBundle,
	feastKeywords: emptyFeedBundle,
} as State;

export { state };
