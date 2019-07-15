import { State } from 'shared/types/State';
import { CollectionItemSets } from 'shared/types/Collection';
import { createSelectArticlesInCollection } from './shared';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import { createSelector } from 'reselect';
import { selectArticleFragment } from '../selectors/shared';

const selectArticleIdsInCollection = createSelectArticlesInCollection();

// Does not return UUIDs. Returns interal page codes for fetching articleFragments
export const selectArticlesInCollections = createSelector(
  (
    state: State,
    {
      collectionIds,
      itemSet
    }: { collectionIds: string[]; itemSet: CollectionItemSets }
  ) =>
    collectionIds.map(_ =>
      selectArticleIdsInCollection(state, {
        collectionId: _,
        collectionSet: itemSet
      })
        .map(articleId => selectArticleFragment(state, articleId))
        .map(article => article.id)
    ),
  articleIds => uniq(flatten(articleIds))
);

export const createSelectIsArticleInCollection = () => {
  const selectArticlesInCollection = createSelectArticlesInCollection();
  return createSelector(
    selectArticlesInCollection,
    (
      _: State,
      { articleFragmentId: articleId }: { articleFragmentId: string }
    ) => articleId,
    (articleIds, articleId) => articleIds.indexOf(articleId) !== -1
  );
};
