import { State } from 'types/State';
import { getCollectionConfig } from './frontsSelectors';
import {
  selectSharedState,
  createArticlesInCollectionSelector
} from 'shared/selectors/shared';
import { isDirty } from 'redux-form';
import { CollectionItemSets } from 'shared/types/Collection';

const isCollectionUneditableSelector = (state: State, id: string): boolean =>
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
  isCollectionUneditableSelector,
  isCollectionBackfilledSelector,
  collectionHasUnsavedArticleEditsWarningSelector as createCollectionHasUnsavedArticleEditsWarningSelector
};
