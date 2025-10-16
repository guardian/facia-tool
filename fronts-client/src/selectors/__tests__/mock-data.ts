import { FrontConfig } from '../../types/FaciaApi';
import {
	CollectionWithNestedArticles,
	NestedCard,
} from '../../types/Collection';

const editorialFrontsInConfig: FrontConfig[] = [
	{ collections: ['collection1'], id: 'editorialFront', priority: 'editorial' },
	{
		collections: ['collection6'],
		id: 'editorialFront2',
		priority: 'editorial',
	},
];

const additionalEditorialFronts: FrontConfig[] = [
	{
		collections: ['collection2'],
		id: 'editorialNotShared',
		priority: 'editorial',
	},
	{
		collections: ['collection5', 'collection3'],
		id: 'editorialSharedWithTraining',
		priority: 'editorial',
	},
];

const trainingFronts: FrontConfig[] = [
	{
		collections: ['collection3'],
		id: 'trainingFront',
		priority: 'training',
	},
];

const commercialFronts: FrontConfig[] = [
	{
		collections: ['collection1'],
		id: 'commercialFront',
		priority: 'commercial',
	},
];

const cardTop100Footballers: NestedCard = {
	id: 'top-100-footballers',
	frontPublicationDate: 1540379258808,
	meta: {},
};

const cardQuestionOfSport: NestedCard = {
	id: 'question-of-sport',
	frontPublicationDate: 1540379258808,
	meta: {},
};

const cardStrictlyComeDancing: NestedCard = {
	id: 'strictly-come-dancing',
	frontPublicationDate: 1540379258808,
	meta: {},
};

const cardTurnerExhibition: NestedCard = {
	id: 'jmw-turner-exhibition',
	frontPublicationDate: 1540379258808,
	meta: {},
};

const cardBillieEilishReview: NestedCard = {
	id: 'billie-eilish-review',
	frontPublicationDate: 1540379258808,
	meta: {},
};

const cardDonkeyKongObituary: NestedCard = {
	id: 'donkey-kong-obituary',
	frontPublicationDate: 1540379258808,
	meta: {},
};

const collectionObituaries: CollectionWithNestedArticles = {
	id: 'obituaries',
	displayName: 'obituaries',
	live: [cardDonkeyKongObituary],
	draft: [cardDonkeyKongObituary],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionFootball: CollectionWithNestedArticles = {
	id: 'football',
	displayName: 'football',
	live: [cardTop100Footballers],
	draft: [cardTop100Footballers],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionSport: CollectionWithNestedArticles = {
	id: 'sport',
	displayName: 'sport',
	live: [cardQuestionOfSport, cardTop100Footballers],
	draft: [cardQuestionOfSport, cardTop100Footballers],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionWhatToWatch: CollectionWithNestedArticles = {
	id: 'what-to-watch',
	displayName: 'what-to-watch',
	live: [cardQuestionOfSport, cardStrictlyComeDancing],
	draft: [cardQuestionOfSport, cardStrictlyComeDancing],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionCulture: CollectionWithNestedArticles = {
	id: 'culture',
	displayName: 'culture',
	live: [cardBillieEilishReview, cardTurnerExhibition, cardStrictlyComeDancing],
	draft: [
		cardBillieEilishReview,
		cardTurnerExhibition,
		cardStrictlyComeDancing,
	],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionsOnFront: CollectionWithNestedArticles[] = [
	collectionFootball,
	collectionSport,
	collectionWhatToWatch,
	collectionCulture,
	collectionObituaries,
];

export {
	editorialFrontsInConfig,
	additionalEditorialFronts,
	trainingFronts,
	commercialFronts,
	collectionObituaries,
	collectionFootball,
	collectionSport,
	collectionWhatToWatch,
	collectionCulture,
	collectionsOnFront,
};
