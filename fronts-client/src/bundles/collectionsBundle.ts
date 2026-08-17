import {
	createIndexedAsyncResourceBundle,
	State as LibState,
	Actions,
} from 'lib/createAsyncResourceBundle';
import { Collection } from 'types/Collection';
import { State } from 'types/State';
import { addPersistMetaToAction } from '../util/action';
import set from 'lodash/fp/set';
import { createSelector } from 'reselect';

const collectionsEntityName = 'collections';

const { actions, actionNames, reducer, selectors, initialState } =
	createIndexedAsyncResourceBundle<Collection>(collectionsEntityName, {});

const stages = ['live', 'draft', 'previously'] as const;

/**
 * All card ids that a group contributes: the group's own cards, plus any
 * supporting cards nested under them.
 */
const getCardIdsForGroup = (
	groupId: string,
	groups: State['groups'],
	cards: State['cards'],
): string[] => {
	const cardIds = groups[groupId]?.cards || [];
	const supportingIds = cardIds.flatMap(
		(cardId) => cards[cardId]?.meta?.supporting || [],
	);
	return [...cardIds, ...supportingIds];
};

/** All group ids belonging to a collection, across every stage. */
const getGroupIdsForCollection = (
	collection: State['collections']['data'][string],
): string[] => stages.flatMap((stage) => collection[stage] || []);

/**
 * Build a reverse lookup of card id (including supporting card ids) to the id of
 * the collection that contains it. This is memoised on the collections, groups
 * and cards slices so the full tree is only traversed when one of them changes,
 * rather than on every `selectParentCollectionOfCard` call.
 *
 */
const selectCardToCollectionMap = createSelector(
	(state: State) => state.collections.data,
	(state: State) => state.groups,
	(state: State) => state.cards,
	(collectionsData, groups, cards): Record<string, string> => {
		const map: Record<string, string> = {};
		for (const collectionId of Object.keys(collectionsData)) {
			const groupIds = getGroupIdsForCollection(collectionsData[collectionId]);
			const cardIds = groupIds.flatMap((groupId) =>
				getCardIdsForGroup(groupId, groups, cards),
			);
			for (const cardId of cardIds) {
				if (!(cardId in map)) {
					map[cardId] = collectionId;
				}
			}
		}
		return map;
	},
);

const collectionSelectors = {
	...selectors,
	selectCardToCollectionMap,
	selectParentCollectionOfCard: (state: State, cardId: string): string | null =>
		selectCardToCollectionMap(state)[cardId] ?? null,
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
	state: LibState<Record<string, Collection>>,
	action: CollectionActions,
): LibState<Record<string, Collection>> => {
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
