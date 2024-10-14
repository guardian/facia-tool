import createAsyncResourceBundle, {
	State as LibState,
	Actions,
} from 'lib/createAsyncResourceBundle';
import { Collection } from 'types/Collection';
import { State } from 'types/State';
import { addPersistMetaToAction } from '../util/action';
import set from 'lodash/fp/set';

const collectionsEntityName = 'collections';

const { actions, actionNames, reducer, selectors, initialState } =
	createAsyncResourceBundle<Collection>(collectionsEntityName, {
		indexById: true,
	});

const collectionSelectors = {
	...selectors,
	selectParentCollectionOfCard: (
		state: State,
		cardId: string,
	): string | null => {
		let collectionId: null | string = null;
		Object.keys(state.collections.data).some((id) =>
			['live', 'draft', 'previously'].some((stage) => {
				const groups = state.collections.data[id][stage] || [];

				return groups.some((gId: string) => {
					const cards = state.groups[gId].cards || [];
					if (cards.indexOf(cardId) !== -1) {
						collectionId = id;
						return true;
					}

					return cards.some((afId: string) => {
						if (
							state.cards[afId] &&
							state.cards[afId].meta &&
							state.cards[afId].meta.supporting &&
							state.cards[afId].meta.supporting!.indexOf(cardId) !== -1
						) {
							collectionId = id;
							return true;
						}
						return false;
					});
				});
			}),
		);
		return collectionId;
	},
};

const SET_HIDDEN = 'SET_HIDDEN' as 'SET_HIDDEN';

const setHidden = (collectionId: string, isHidden: boolean) => ({
	entity: collectionsEntityName,
	type: SET_HIDDEN,
	payload: {
		collectionId,
		isHidden,
	},
});

const setHiddenAndPersist = addPersistMetaToAction(setHidden, {
	persistTo: 'collection',
	key: 'collectionId',
	entity: 'collection',
});

export type SetHidden = ReturnType<typeof setHidden>;

const collectionActions = {
	...actions,
	setHiddenAndPersist,
};

type CollectionActions = Actions<Collection> | SetHidden;

const collectionReducer = (
	state: LibState<Collection>,
	action: CollectionActions,
): LibState<Collection> => {
	const updatedState = reducer(state, action);
	switch (action.type) {
		case SET_HIDDEN: {
			if (!updatedState.data[action.payload.collectionId]) {
				return updatedState;
			}

			return set(
				['data', action.payload.collectionId, 'isHidden'],
				action.payload.isHidden,
				updatedState,
			);
		}
		default: {
			return updatedState;
		}
	}
};

export {
	collectionActions as actions,
	actionNames,
	collectionSelectors as selectors,
	collectionReducer as reducer,
	initialState,
};
