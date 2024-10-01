import type { State } from 'types/State';
import { Card, CardSets } from 'types/Collection';
import { createSelectCardsInCollection } from './shared';
import { createSelector } from 'reselect';
import { selectCard } from '../selectors/shared';

const selectCardsInCollection = createSelectCardsInCollection();

// Unmemoized – intended to be used for fetch calls.
// Will need to be memoized if used in UI.
export const selectCardsInCollections = (
	state: State,
	{ collectionIds, itemSet }: { collectionIds: string[]; itemSet: CardSets },
): Card[] =>
	collectionIds.flatMap((_) =>
		selectCardsInCollection(state, {
			collectionId: _,
			collectionSet: itemSet,
		}).map((cardId) => selectCard(state, cardId)),
	);

export const selectChefsInCollections = (
	state: State,
	{ collectionIds, itemSet }: { collectionIds: string[]; itemSet: CardSets },
) => {};

export const createSelectIsArticleInCollection = () => {
	const selectArticlesInCollection = createSelectCardsInCollection();
	return createSelector(
		selectArticlesInCollection,
		(_: State, { cardId: articleId }: { cardId: string }) => articleId,
		(articleIds, articleId) => articleIds.indexOf(articleId) !== -1,
	);
};
