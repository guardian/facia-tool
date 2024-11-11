import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import clipboardReducer from '../../reducers/clipboardReducer';
import groupsReducer from 'reducers/groupsReducer';
import cardsReducer from 'reducers/cardsReducer';
import {
	createSelectGroupArticles,
	createSelectSupportingArticles,
	selectCard,
} from 'selectors/shared';
import { selectClipboard as innerClipboardSelector } from '../../selectors/frontsSelectors';
import { createCardStateFromSpec, CardSpec, specToCard } from './utils';
import {
	moveCard,
	removeCard,
	insertCardWithCreate,
	addImageToCard,
	cloneCardToTarget,
} from 'actions/Cards';
import {
	reducer as collectionsReducer,
	initialState as collectionsState,
} from 'bundles/collectionsBundle';
import optionsModal from 'reducers/modalsReducer';
import config from 'reducers/configReducer';
import { enableBatching } from 'redux-batched-actions';
import { Dispatch } from 'types/Store';
import { selectClipboardArticles } from 'selectors/clipboardSelectors';

const root = (state: any = {}, action: any) => ({
	optionsModal: optionsModal(state.optionsModal, action),
	clipboard: clipboardReducer(state.clipboard, action),
	path: '',
	cards: cardsReducer(state.cards, action),
	collections: collectionsReducer(state.collections, action),
	groups: groupsReducer(state.groups, action, state),
	config: config(state.config, action),
});

const buildStore = (added: CardSpec, collectionCap = Infinity) => {
	const groupA: CardSpec[] = [
		['a', '1', [['g', '7']]],
		['b', '2', undefined],
		['c', '3', undefined],
	];
	const groupB: CardSpec[] = [
		['i', '9', [['g', '7']]],
		['j', '10', undefined],
		['k', '11', undefined],
	];
	const clipboard: CardSpec[] = [
		['d', '4', [['g', '7']]],
		['e', '5', undefined],
		['f', '6', undefined],
	];
	const all = [...groupA, ...groupB, ...clipboard, added];
	const state = {
		path: '',
		config: {
			collectionCap,
		},
		collections: {
			...collectionsState,
			data: {
				a: {
					id: 'a',
					live: ['a', 'b'],
				},
			},
		},
		cards: createCardStateFromSpec(all),
		groups: {
			a: { cards: groupA.map(([uuid]) => uuid), uuid: 'a' },
			b: { cards: groupB.map(([uuid]) => uuid), uuid: 'b' },
		},
		clipboard: clipboard.map(([uuid]) => uuid),
	};
	const { getState, dispatch } = createStore(
		enableBatching(root),
		state as any,
		applyMiddleware(thunk),
	);
	return {
		getState,
		dispatch: dispatch as Dispatch,
	};
};

const insert = async (
	insertedCardSpec: [string, string],
	index: number,
	parentType: string,
	parentId: string,
	// sets the collection cap and allows a way to accept, reject, ignore the
	// modal immediately
	collectionCapInfo?: {
		cap: number;
		accept: boolean | null;
	},
) => {
	const [uuid, id] = insertedCardSpec;
	const { dispatch, getState } = buildStore(
		[uuid, id, undefined],
		collectionCapInfo ? collectionCapInfo.cap : Infinity,
	);

	const stateHere: any = getState();
	await dispatch(
		insertCardWithCreate(
			{ type: parentType, id: parentId, index },
			{ type: 'REF', data: parentId },
			'collection',
			(afId) => () => Promise.resolve(selectCard(stateHere, uuid)),
		) as any,
	);

	return getState();
};

const move = (
	movedCardSpec: [string, string],
	index: number,
	toType: string,
	toId: string,
	fromType: string,
	fromId: string,
	// sets the collection cap and allows a way to accept, reject, ignore the
	// modal immediately
	collectionCapInfo?: {
		cap: number;
		accept: boolean | null;
	},
) => {
	const [uuid, id] = movedCardSpec;
	const { dispatch, getState } = buildStore(
		[uuid, id, undefined],
		collectionCapInfo ? collectionCapInfo.cap : Infinity,
	);
	dispatch(
		moveCard(
			{
				type: toType,
				id: toId,
				index,
			},
			specToCard([uuid, id, undefined]),
			{
				id: fromId,
				type: fromType,
				index: -1, // this doesn't matter
			},
			'clipboard', // doesn't matter where we persist
		) as any,
	);

	// TODO: use modal service to mock return from modal
	// if (collectionCapInfo && collectionCapInfo.accept !== null) {
	//   dispatch(endConfirmModal(collectionCapInfo.accept));
	// }

	return getState();
};

const remove = (
	id: string,
	parentId: string,
	type: 'collection' | 'clipboard' | 'card',
) => {
	const { dispatch, getState } = buildStore(
		['uuid', 'id', undefined],
		Infinity,
	);
	dispatch(
		removeCard(
			type,
			parentId,
			id,
			'clipboard', // doesn't matter where we persist
		) as any,
	);

	return getState();
};

const selectClipboard = (state: any) => innerClipboardSelector(state);

const selectGroupArticlesInner = createSelectGroupArticles();
const selectGroupArticles = (state: any, groupId: string) =>
	selectGroupArticlesInner(state, { groupId }).map(({ uuid }) => uuid);

const selectSupportingArticlesInner = createSelectSupportingArticles();
const selectSupportingArticles = (state: any, cardId: string) =>
	selectSupportingArticlesInner(state, { cardId }).map(({ uuid }) => uuid);

describe('Cards actions', () => {
	describe('insert', () => {
		it('adds cards that exist in the state', async () => {
			expect(
				selectClipboard(await insert(['h', '8'], 2, 'clipboard', 'clipboard')),
			).toEqual(['d', 'e', 'h', 'f']);

			expect(
				selectGroupArticles(await insert(['h', '8'], 2, 'group', 'a'), 'a'),
			).toEqual(['a', 'b', 'h', 'c']);

			expect(
				selectSupportingArticles(await insert(['h', '8'], 2, 'card', 'a'), 'a'),
			).toEqual(['g', 'h']);
		});

		it('moves existing articles when duplicates are added', async () => {
			expect(
				selectClipboard(await insert(['h', '6'], 0, 'clipboard', 'clipboard')),
			).toEqual(['h', 'd', 'e']);

			expect(
				selectGroupArticles(await insert(['h', '3'], 0, 'group', 'a'), 'a'),
			).toEqual(['h', 'a', 'b']);

			expect(
				selectSupportingArticles(await insert(['h', '7'], 0, 'card', 'a'), 'a'),
			).toEqual(['h']);
		});

		it('dedupe across groups in the same collection', async () => {
			const state = await insert(['h', '3'], 0, 'group', 'b');
			expect(selectGroupArticles(state, 'a')).toEqual(['a', 'b']);
			expect(selectGroupArticles(state, 'b')).toEqual(['h', 'i', 'j', 'k']);
		});

		it('adds to the end when the index is too high', async () => {
			expect(
				selectClipboard(
					await insert(['h', '8'], 100, 'clipboard', 'clipboard'),
				),
			).toEqual(['d', 'e', 'f', 'h']);

			expect(
				selectGroupArticles(await insert(['h', '8'], 100, 'group', 'a'), 'a'),
			).toEqual(['a', 'b', 'c', 'h']);

			expect(
				selectSupportingArticles(
					await insert(['h', '8'], 100, 'card', 'a'),
					'a',
				),
			).toEqual(['g', 'h']);
		});

		// TODO: Remove skip when mock modal service is implemented
		it.skip('enforces collection caps on insert through a modal', async () => {
			expect(
				selectGroupArticles(
					await insert(['h', '8'], 2, 'group', 'a', {
						cap: 3,
						accept: true,
					}),
					'a',
				),
			).toEqual(['a', 'b', 'h']);

			expect(
				selectGroupArticles(
					await insert(['h', '8'], 2, 'group', 'a', {
						cap: 3,
						accept: false,
					}),
					'a',
				),
			).toEqual(['a', 'b', 'c']);
		});
	});

	describe('move', () => {
		it('removes articles from their previous position', () => {
			const s1 = move(['d', '4'], 0, 'group', 'a', 'clipboard', 'clipboard');
			expect(selectGroupArticles(s1, 'a')).toEqual(['d', 'a', 'b', 'c']);
			expect(selectClipboard(s1)).toEqual(['e', 'f']);

			const s2 = move(['a', '1'], 0, 'clipboard', 'clipboard', 'group', 'a');
			expect(selectGroupArticles(s2, 'a')).toEqual(['b', 'c']);
			expect(selectClipboard(s2)).toEqual(['a', 'd', 'e', 'f']);
		});

		// TODO: Remove skip when mock modal service is implemented
		it.skip('enforces collection caps on move through a modal', () => {
			const s1 = move(['d', '4'], 0, 'group', 'a', 'clipboard', 'clipboard', {
				cap: 3,
				accept: true,
			});
			expect(selectGroupArticles(s1, 'a')).toEqual(['d', 'a', 'b']);
			expect(selectClipboard(s1)).toEqual(['e', 'f']);

			const s2 = move(['d', '4'], 0, 'group', 'a', 'clipboard', 'clipboard', {
				cap: 3,
				accept: false,
			});
			expect(selectGroupArticles(s2, 'a')).toEqual(['a', 'b', 'c']);
			expect(selectClipboard(s2)).toEqual(['d', 'e', 'f']);
		});

		// TODO: Remove skip when mock modal service is implemented
		it.skip('collection caps allow moves within collections without a modal', () => {
			const s1 = move(['a', '1'], 2, 'group', 'a', 'group', 'a', {
				cap: 6,
				accept: null,
			});
			expect(selectGroupArticles(s1, 'a')).toEqual(['b', 'c', 'a']);
		});
	});

	describe('remove', () => {
		it('removes cards that exist in the state', async () => {
			expect(
				selectClipboard(await remove('d', 'clipboard', 'clipboard')),
			).toEqual(['e', 'f']);
		});
		it('removes cards from supporting positions', async () => {
			expect(
				selectSupportingArticles(await remove('g', 'd', 'card'), 'd'),
			).toEqual([]);
		});
	});

	describe('cloneToTarget', () => {
		it('clones an card into a new collection preserving its metadata', () => {
			const store = buildStore([
				'123',
				'456',
				undefined,
				{ headline: 'Headline was overwritten with this' },
			]);
			store.dispatch(cloneCardToTarget('123', 'clipboard'));
			const state = store.getState();
			expect(selectClipboardArticles(state as any)[0].id).toEqual('456');
			expect(selectClipboardArticles(state as any)[0].meta).toEqual({
				supporting: [],
				headline: 'Headline was overwritten with this',
			});
		});
	});

	describe('insert image', () => {
		it('adds the correct image data', () => {
			const s1 = root({ cards: { a: {} } }, { type: '@@INIT' });

			const src = 'http://www.images.com/image/1/master';
			const thumb = 'http://www.images.com/image/1/thumb';
			const origin = 'http://www.images.com/image/1';
			const height = 3000;
			const width = 3000;

			const s2 = root(
				s1,
				addImageToCard('collection')('a', {
					src,
					thumb,
					origin,
					height,
					width,
				}),
			);

			expect(s2.cards.a.meta).toMatchObject({
				imageSrc: src,
				imageSrcThumb: thumb,
				imageSrcOrigin: origin,
				imageSrcWidth: width.toString(),
				imageSrcHeight: height.toString(),
				imageReplace: true,
				imageSlideshowReplace: false,
				imageCutoutReplace: false,
			});
		});
	});
});
