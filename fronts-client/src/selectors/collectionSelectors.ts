import type { State } from 'types/State';
import { selectCollectionConfig } from './frontsSelectors';
import { createSelectCollection, groupsArticleCount } from 'selectors/shared';
import { getUpdatedSiblingGroupsForInsertion } from 'reducers/groupsReducer';

const selectCollection = createSelectCollection();

const selectCollectionParams = (
	state: State,
	collectionIds: string[],
	returnOnlyUpdatedCollections: boolean = false,
): Array<{ id: string; lastUpdated?: number }> =>
	collectionIds.reduce(
		(collections: Array<{ id: string; lastUpdated?: number }>, id) => {
			const config = selectCollectionConfig(state, id);
			if (!config) {
				throw new Error(`Collection ID ${id} does not exist in config`);
			}

			if (!returnOnlyUpdatedCollections) {
				collections.push({ id });
			}

			if (returnOnlyUpdatedCollections) {
				const maybeCollection = selectCollection(state, {
					collectionId: id,
				});
				// Some collections are automated and they don't have any content in them.
				// We ignore these collections and don't fetch updates for them.
				if (maybeCollection) {
					const lastUpdated = maybeCollection.lastUpdated;
					collections.push({ id, lastUpdated });
				}
			}
			return collections;
		},
		[],
	);

const selectIsCollectionLocked = (state: State, id: string): boolean =>
	!!selectCollectionConfig(state, id)?.uneditable;

const selectWillCollectionHitCollectionCap = (
	state: State,
	groupId: string,
	index: number,
	cardId: string,
	collectionCap: number,
) => {
	const patch = getUpdatedSiblingGroupsForInsertion(
		state,
		state.groups,
		groupId,
		index,
		cardId,
	);
	const articleCount = groupsArticleCount(Object.values(patch));
	return collectionCap && articleCount > collectionCap;
};

export {
	selectWillCollectionHitCollectionCap,
	selectCollectionParams,
	selectIsCollectionLocked,
};
