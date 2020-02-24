import { SharedState } from 'types/State';
import { CardSets } from 'types/Collection';
import { createSelectArticlesInCollection } from './shared';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import { createSelector } from 'reselect';
import { selectCard } from '../selectors/shared';

const selectArticleIdsInCollection = createSelectArticlesInCollection();

// Does not return UUIDs. Returns interal page codes for fetching cards
export const selectArticlesInCollections = createSelector(
  (
    state: SharedState,
    { collectionIds, itemSet }: { collectionIds: string[]; itemSet: CardSets }
  ) =>
    collectionIds.map(_ =>
      selectArticleIdsInCollection(state, {
        collectionId: _,
        collectionSet: itemSet
      })
        .map(articleId => selectCard(state, articleId))
        .map(article => article.id)
    ),
  articleIds => uniq(flatten(articleIds))
);

export const createSelectIsArticleInCollection = () => {
  const selectArticlesInCollection = createSelectArticlesInCollection();
  return createSelector(
    selectArticlesInCollection,
    (_: SharedState, { cardId: articleId }: { cardId: string }) => articleId,
    (articleIds, articleId) => articleIds.indexOf(articleId) !== -1
  );
};
