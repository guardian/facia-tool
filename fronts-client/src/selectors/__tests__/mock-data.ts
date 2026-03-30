import { FrontConfig } from '../../types/FaciaApi';
import { CardMap, Collection, GroupMap } from '../../types/Collection';

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

const collectionPremierLeague: Collection = {
	id: 'premierLeagueCollectionUuid',
	displayName: 'premier-league',
	live: ['groupUuid6'],
	draft: ['groupUuid6'],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionChampionship: Collection = {
	id: 'championshipCollectionUuid',
	displayName: 'championship',
	live: ['groupUuid7'],
	draft: ['groupUuid7'],
	targetedRegions: [],
	excludedRegions: [],
};

const collectionFootballLeague: Collection = {
	id: 'footballLeagueCollectionUuid',
	displayName: 'football-league',
	live: ['groupUuid8'],
	draft: ['groupUuid8'],
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

const collectionUnpublishedChanges: Collection = {
	id: 'unpublishedCollectionUuid',
	displayName: 'unpublished',
	live: ['groupUuid6'],
	draft: ['groupUuid2'],
	targetedRegions: [],
	excludedRegions: [],
};

const allCollections = [
	collectionObituaries,
	collectionFootball,
	collectionPremierLeague,
	collectionChampionship,
	collectionFootballLeague,
	collectionSport,
	collectionWhatToWatch,
	collectionCulture,
	collectionUnpublishedChanges,
];

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
	groupUuid6: {
		id: 'group-6',
		name: 'Group 6',
		uuid: 'groupUuid6',
		cards: ['cardUuid7'],
	},
	groupUuid7: {
		id: 'group-7',
		name: 'Group 7',
		uuid: 'groupUuid7',
		cards: ['cardUuid8'],
	},
	groupUuid8: {
		id: 'group-8',
		name: 'Group 8',
		uuid: 'groupUuid8',
		cards: ['cardUuid10'],
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
	cardUuid7: {
		uuid: 'cardUuid7',
		id: 'premier-league-roundup',
		frontPublicationDate: 0,
		meta: {
			supporting: ['cardUuid9', 'cardUuid10'],
		},
	},
	cardUuid8: {
		uuid: 'cardUuid8',
		id: 'championship-roundup',
		frontPublicationDate: 0,
		meta: {
			supporting: ['cardUuid10'],
		},
	},
	cardUuid9: {
		uuid: 'cardUuid9',
		id: 'premier-league-golden-boot',
		frontPublicationDate: 0,
		meta: {},
	},
	cardUuid10: {
		uuid: 'cardUuid10',
		id: 'football-league-roundup',
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
	collectionPremierLeague,
	collectionChampionship,
	collectionFootballLeague,
	collectionSport,
	collectionWhatToWatch,
	collectionCulture,
	collectionUnpublishedChanges,
	allCollections,
	groupMap,
	cardMap,
};
