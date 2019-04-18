import { State } from 'types/State';
import { getCollectionConfig } from './frontsSelectors';
import {
  selectSharedState,
  createCollectionSelector,
  groupsArticleCount
} from 'shared/selectors/shared';
import flatten from 'lodash/flatten';
import { createSelectEditorFrontsByPriority } from 'bundles/frontsUIBundle';
import { getUpdatedSiblingGroupsForInsertion } from 'shared/reducers/groupsReducer';

const selectCollection = createCollectionSelector();

const collectionParamsSelector = (
  state: State,
  collectionIds: string[],
  returnOnlyUpdatedCollections: boolean = false
): Array<{ id: string; lastUpdated?: number }> =>
  collectionIds.reduce(
    (collections: Array<{ id: string; lastUpdated?: number }>, id) => {
      const config = getCollectionConfig(state, id);
      if (!config) {
        throw new Error(`Collection ID ${id} does not exist in config`);
      }

      if (!returnOnlyUpdatedCollections) {
        collections.push({ id });
      }

      if (returnOnlyUpdatedCollections) {
        const maybeCollection = selectCollection(selectSharedState(state), {
          collectionId: id
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
    []
  );

function createCollectionsInOpenFrontsSelector() {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return (state: State, priority: string): string[] => {
    const openFrontsForPriority = selectEditorFrontsByPriority(state, {
      priority
    });
    return flatten(openFrontsForPriority.map(front => front.collections));
  };
}

const isCollectionLockedSelector = (state: State, id: string): boolean =>
  !!getCollectionConfig(state, id).uneditable;

const willCollectionHitCollectionCapSelector = (
  state: State,
  groupId: string,
  index: number,
  articleFragmentId: string,
  collectionCap: number
) => {
  const shared = selectSharedState(state);
  const patch = getUpdatedSiblingGroupsForInsertion(
    shared,
    shared.groups,
    groupId,
    index,
    articleFragmentId
  );
  const articleCount = groupsArticleCount(Object.values(patch));
  return collectionCap && articleCount > collectionCap;
};

export {
  willCollectionHitCollectionCapSelector,
  collectionParamsSelector,
  isCollectionLockedSelector,
  createCollectionsInOpenFrontsSelector
};
