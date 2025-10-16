import { defaultState } from 'bundles/frontsUI';
import { frontsConfig } from 'fixtures/frontsConfig';
import { state as initialState } from './initialState';
import type { State } from 'types/State';

const state = {
	...initialState,
	fronts: {
		...initialState.fronts,
		frontsConfig: {
			...initialState.fronts.frontsConfig,
			...frontsConfig,
		},
	},
	editor: {
		...defaultState,
		frontIdsByPriority: {
			editorial: ['editorialFront', 'editorialFront2'],
		},
		collectionIds: [],
		frontIdsByBrowsingStage: {},
	},
	collections: {
		...initialState.collections,
		data: {
			collectionUuid1: {
				id: 'collectionUuid1',
				draft: ['group1'],
				live: [],
			},
			collectionUuid6: {
				id: 'collectionUuid6',
				draft: [],
				live: [],
			},
		},
	},
	groups: {
		...initialState.groups,
		group1: {
			uuid: 'group1',
			id: 'group1',
			name: 'Group 1',
			cards: ['card1', 'card2', 'card3'],
		},
	},
	cards: {
		...initialState.cards,
		card1: {
			uuid: 'card1',
			id: 'capiArticle1',
			frontPublicationDate: 0,
			meta: {},
		},
		card2: {
			uuid: 'card2',
			id: 'capiArticle2',
			frontPublicationDate: 0,
			meta: {},
		},
		card3: {
			uuid: 'card3',
			frontPublicationDate: 0,
			id: 'capiArticle3',
			meta: {},
		},
	},
	externalArticles: {
		...initialState.externalArticles,
		data: {
			capiArticle1: {
				id: 'capiArticle1',
				urlPath: 'path/capiArticle1',
				frontsMeta: {},
				fields: {},
			},
			capiArticle2: {
				id: 'capiArticle2',
				urlPath: 'path/capiArticle2',
				frontsMeta: {},
				fields: {},
			},
			capiArticle3: {
				id: 'capiArticle3',
				urlPath: 'path/capiArticle3',
				frontsMeta: {},
				fields: {},
			},
		},
	},
	path: '/v2/editorial',
} as State;

export default state;
