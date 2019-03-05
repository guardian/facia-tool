import { State } from 'types/State';
import { getCollectionConfig } from './frontsSelectors';
import {
  selectSharedState,
  createArticlesInCollectionSelector,
  createCollectionSelector
} from 'shared/selectors/shared';
import { isDirty } from 'redux-form';
import { CollectionItemSets } from 'shared/types/Collection';

const selectCollection = createCollectionSelector();

function collectionParamsSelector(
  state: State,
  collectionIds: string[],
  returnOnlyUpdatedCollections: boolean = false
): Array<{ id: string; lastUpdated?: number }> {
  const params = collectionIds.map(id => {
    const config = getCollectionConfig(state, id);
    if (!config) {
      throw new Error(`Collection ID ${id} does not exist in config`);
    }

    if (!returnOnlyUpdatedCollections) {
      return { id };
    }

    const maybeCollection = selectCollection(selectSharedState(state), {
      collectionId: id
    });
    if (!maybeCollection) {
      throw new Error(`Collection ID ${id} does not exist in state`);
    }
    const lastUpdated = maybeCollection.lastUpdated;
    return { id, lastUpdated };
  });

  return params;
}

const isCollectionLockedSelector = (state: State, id: string): boolean =>
  !!getCollectionConfig(state, id).uneditable;

const isCollectionBackfilledSelector = (state: State, id: string): boolean =>
  !!getCollectionConfig(state, id).backfill;

const collectionHasUnsavedArticleEditsWarningSelector = () => {
  const articlesInCollectionSelector = createArticlesInCollectionSelector();

  return (
    state: State,
    props: {
      collectionSet: CollectionItemSets;
      collectionId: string;
    }
  ) =>
    articlesInCollectionSelector(selectSharedState(state), props).reduce(
      (hasEdits: boolean, article: string) =>
        hasEdits || isDirty(article)(state),
      false
    );
};

export {
  collectionParamsSelector,
  isCollectionLockedSelector,
  isCollectionBackfilledSelector,
  collectionHasUnsavedArticleEditsWarningSelector as createCollectionHasUnsavedArticleEditsWarningSelector
};
