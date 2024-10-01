import { createStore, compose, applyMiddleware } from 'redux';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';
import { persistCollectionOnEdit } from 'util/storeMiddleware';
import { enableBatching } from 'redux-batched-actions';
import { moveCard } from 'actions/Cards';
import { Dispatch } from 'types/Store';
import rootReducer from 'reducers/rootReducer';
import { NestedCard } from 'types/Collection';
import { updateCollection } from 'actions/Collections';

const A1 = {
	uuid: 'a1',
	id: 'a',
	frontPublicationDate: 1000,
	meta: {},
};

const A2 = {
	uuid: 'a2',
	id: 'b',
	frontPublicationDate: 2000,
	meta: {},
};

const A3 = {
	uuid: 'a3',
	id: 'c',
	frontPublicationDate: 2000,
	meta: {},
};

const A4 = {
	uuid: 'a4',
	id: 'd',
	frontPublicationDate: 2000,
	meta: {},
};

const init = () => {
	const initState = {
		path: '/v2/editorial',
		collections: {
			loadingIds: [],
			updatingIds: [],
			data: {
				c1: {
					type: 'fixed/thrasher',
					id: 'c1',
					live: ['g1'],
					draft: [],
					previously: [],
				},
				c2: {
					type: 'fixed/thrasher',
					id: 'c2',
					live: ['g2'],
					draft: [],
					previously: [],
				},
			},
		},
		groups: {
			g1: {
				uuid: 'g1',
				id: 'g1',
				cards: ['a1', 'a2'],
				name: 'g1',
			},
			g2: {
				uuid: 'g2',
				id: 'g2',
				cards: ['a3', 'a4'],
				name: 'g2',
			},
		},
		cards: {
			a1: A1,
			a2: A2,
			a3: A3,
			a4: A4,
		},
		feed: {},
	};
	const reducer = enableBatching(rootReducer);
	const middleware = compose(
		applyMiddleware(
			thunk,
			// the second param here is debounce time, we have to set this
			// as longer debounce times with lodash/debounce don't play well
			// with jest fake timers
			// https://github.com/facebook/jest/issues/3465
			persistCollectionOnEdit(updateCollection, 1),
		),
	);
	return createStore(reducer, initState as any, middleware);
};

const groupedCardIds = (afs: NestedCard[]) =>
	afs.reduce(
		(acc, af) => ({
			...acc,
			[af.meta.group || 0]: (acc[af.meta.group || 0] || []).concat(af.id),
		}),
		{} as { [groupId: string]: string[] },
	);

jest.useFakeTimers();

describe('Collection persistence', () => {
	describe('moves', () => {
		beforeEach(fetchMock.restore);
		it('makes one persistence request for moves in same collection', () => {
			const { dispatch }: { dispatch: Dispatch } = init();
			fetchMock.mock(/stories-visible/, {});
			fetchMock.mock(
				/v2Edits/,
				{},
				{
					name: 'edits',
				},
			);
			dispatch(
				moveCard(
					{ id: 'g1', type: 'group', index: 1 },
					A1,
					{ id: 'g1', type: 'group', index: 0 },
					'collection',
				),
			);

			jest.runAllTimers();

			// fetch mock typings error
			const calls: any = fetchMock.calls('edits');
			expect(calls).toHaveLength(1);
			const cards = groupedCardIds(
				JSON.parse(calls[0][1].body).collection.live,
			);
			expect(cards).toEqual({ g1: ['b', 'a'] });
		});

		it('moves between two collections DOWNWARDS make two persistence requests', () => {
			const { dispatch }: { dispatch: Dispatch } = init();
			fetchMock.mock(/stories-visible/, {});
			fetchMock.mock(
				/v2Edits/,
				{},
				{
					name: 'edits',
				},
			);
			dispatch(
				moveCard(
					{ id: 'g2', type: 'group', index: 0 },
					A1,
					{ id: 'g1', type: 'group', index: 0 },
					'collection',
				),
			);

			jest.runAllTimers();

			// fetch mock typings error
			const calls: any = fetchMock.calls('edits');
			expect(calls).toHaveLength(2);
			const c1afs = groupedCardIds(
				JSON.parse(calls[0][1].body).collection.live,
			);
			expect(c1afs).toEqual({
				g1: ['b'],
			});
			const c2afs = groupedCardIds(
				JSON.parse(calls[1][1].body).collection.live,
			);
			expect(c2afs).toEqual({
				g2: ['a', 'c', 'd'],
			});
		});

		// @TODO - fix this issue in another PR
		it('moves between collections UPWARDS make two persistence requests', () => {
			const { dispatch }: { dispatch: Dispatch } = init();
			fetchMock.mock(/stories-visible/, {});
			fetchMock.mock(
				/v2Edits/,
				{},
				{
					name: 'edits',
				},
			);
			dispatch(
				moveCard(
					{ id: 'g1', type: 'group', index: 0 },
					A3,
					{ id: 'g2', type: 'group', index: 0 },
					'collection',
				),
			);

			jest.runAllTimers();

			// fetch mock typings error
			const calls: any = fetchMock.calls('edits');
			expect(calls).toHaveLength(2);
			const c1afs = groupedCardIds(
				JSON.parse(calls[0][1].body).collection.live,
			);
			expect(c1afs).toEqual({
				g2: ['d'],
			});
			const c2afs = groupedCardIds(
				JSON.parse(calls[1][1].body).collection.live,
			);
			expect(c2afs).toEqual({
				g1: ['c', 'a', 'b'],
			});
		});
	});
});
