import { State } from 'shared/types/State';
import { CollectionItemSets } from 'shared/types/Collection';
import { createArticlesInCollectionSelector } from './shared';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import { createSelector } from 'reselect';
import { articleFragmentSelector } from '../selectors/shared';

const selectArticleIdsInCollection = createArticlesInCollectionSelector();

export const selectArticlesInCollections = createSelector(
  (
    state: State,
    {
      collectionIds,
      itemSet
    }: { collectionIds: string[]; itemSet: CollectionItemSets }
  ) =>
    collectionIds.map(
      _ =>
        selectArticleIdsInCollection(state, {
          collectionId: _,
          collectionSet: itemSet
        })
          .map(articleId => articleFragmentSelector(state, articleId))
          .map(article => article.id) // TODO WHY IS THIS WORKING? should it not retrun the UUID?
    ),
  articleIds => uniq(flatten(articleIds))
);
