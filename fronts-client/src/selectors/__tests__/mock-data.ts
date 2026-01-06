import { FrontConfig } from '../../types/FaciaApi';
import {
	CardMap,
	Collection,
	CollectionMap,
	GroupMap,
} from '../../types/Collection';

const editorialFrontsInConfig: FrontConfig[] = [
	{
		collections: ['collectionUuid1'],
		id: 'editorialFront',
		priority: 'editorial',
	},
	{
		collections: ['collectionUuid6'],
		id: 'editorialFront2',
		priority: 'editorial',
	},
];

const additionalEditorialFronts: FrontConfig[] = [
	{
		collections: ['collectionUuid2'],
		id: 'editorialNotShared',
		priority: 'editorial',
	},
	{
		collections: ['collectionUuid5', 'collectionUuid3'],
		id: 'editorialSharedWithTraining',
		priority: 'editorial',
	},
];

const trainingFronts: FrontConfig[] = [
	{
		collections: ['collectionUuid3'],
		id: 'trainingFront',
		priority: 'training',
	},
];

const commercialFronts: FrontConfig[] = [
	{
		collections: ['collectionUuid1'],
		id: 'commercialFront',
		priority: 'commercial',
	},
];

const collectionObituaries: Collection = {
	id: 'obituariesCollectionUuid',
	displayName: 'obituaries',
	live: ['groupUuid1'],
	draft: ['groupUuid1'],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionFootball: Collection = {
	id: 'footballCollectionUuid',
	displayName: 'football',
	live: ['groupUuid2'],
	draft: ['groupUuid2'],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionSport: Collection = {
	id: 'sportCollectionUuid',
	displayName: 'sport',
	live: ['groupUuid3'],
	draft: ['groupUuid3'],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionWhatToWatch: Collection = {
	id: 'whatToWatchCollectionUuid',
	displayName: 'what-to-watch',
	live: ['groupUuid4'],
	draft: ['groupUuid4'],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionCulture: Collection = {
	id: 'cultureCollectionUuid',
	displayName: 'culture',
	live: ['groupUuid5'],
	draft: ['groupUuid5'],
	targetedRegions: [],
	excludedRegions: [],
};

const frontConfig: FrontConfig = {
	id: 'front',
	priority: 'editorial',
	collections: [
		'footballCollectionUuid',
		'sportCollectionUuid',
		'whatToWatchCollectionUuid',
		'cultureCollectionUuid',
		'obituariesCollectionUuid',
	],
};

const collectionMap: CollectionMap = {
	obituariesCollectionUuid: collectionObituaries,
	footballCollectionUuid: collectionFootball,
	sportCollectionUuid: collectionSport,
	whatToWatchCollectionUuid: collectionWhatToWatch,
	cultureCollectionUuid: collectionCulture,
};

const groupMap: GroupMap = {
	groupUuid1: {
		id: 'group-1',
		name: 'Group 1',
		uuid: 'groupUuid1',
		cards: ['cardUuid1'],
	},
	groupUuid2: {
		id: 'group-2',
		name: 'Group 2',
		uuid: 'groupUuid2',
		cards: ['cardUuid2'],
	},
	groupUuid3: {
		id: 'group-3',
		name: 'Group 3',
		uuid: 'groupUuid3',
		cards: ['cardUuid2', 'cardUuid3'],
	},
	groupUuid4: {
		id: 'group-4',
		name: 'Group 4',
		uuid: 'groupUuid4',
		cards: ['cardUuid3', 'cardUuid4'],
	},
	groupUuid5: {
		id: 'group-5',
		name: 'Group 5',
		uuid: 'groupUuid5',
		cards: ['cardUuid4', 'cardUuid5', 'cardUuid6'],
	},
};

const cardMap: CardMap = {
	cardUuid1: {
		uuid: 'cardUuid1',
		id: 'donkey-kong-obituary',
		frontPublicationDate: 0,
		meta: {},
	},
	cardUuid2: {
		uuid: 'cardUuid2',
		id: 'top-100-footballers',
		frontPublicationDate: 0,
		meta: {},
	},
	cardUuid3: {
		uuid: 'cardUuid3',
		id: 'question-of-sport',
		frontPublicationDate: 0,
		meta: {},
	},
	cardUuid4: {
		uuid: 'cardUuid4',
		id: 'strictly-come-dancing',
		frontPublicationDate: 0,
		meta: {},
	},
	cardUuid5: {
		uuid: 'cardUuid5',
		id: 'billie-eilish-review',
		frontPublicationDate: 0,
		meta: {},
	},
	cardUuid6: {
		uuid: 'cardUuid6',
		id: 'jmw-turner-exhibition',
		frontPublicationDate: 0,
		meta: {},
	},
};

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
	collectionMap,
	frontConfig,
	groupMap,
	cardMap,
};
