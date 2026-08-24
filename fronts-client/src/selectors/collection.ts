import type { State } from 'types/State';
import { Card, CardSets } from 'types/Collection';
import {
	createSelectArticleFromCard,
	createSelectCardsInCollection,
} from './shared';
import { createSelector } from 'reselect';
import { selectCard } from '../selectors/shared';
import { frontStages } from 'constants/fronts';
import {
	AbTestHeadlineErrorType,
	getCurrentAbTestHeadlineError,
} from 'util/abTests';

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

export interface AbTestHeadlineError {
	cardId: string;
	title: string | undefined;
	error: AbTestHeadlineErrorType;
}

/**
 * Return the offending card and the reason for each card in the
 * collection's draft set that has an active headline A/B test
 * with invalid variant headlines.
 * An empty array means the collection can be launched.
 */
export const createSelectActiveAbTestHeadlineErrorsForCollection = () => {
	const selectDraftCardIds = createSelectCardsInCollection();
	const selectArticleFromCard = createSelectArticleFromCard();
	return (
		state: State,
		{ collectionId }: { collectionId: string },
	): AbTestHeadlineError[] => {
		const cardIds = selectDraftCardIds(state, {
			collectionId,
			collectionSet: frontStages.draft,
		});
		return cardIds.reduce<AbTestHeadlineError[]>((errors, cardId) => {
			const card = selectCard(state, cardId);
			if (!card) {
				return errors;
			}
			const error = getCurrentAbTestHeadlineError(card);
			if (!error) {
				return errors;
			}
			const derivedArticle = selectArticleFromCard(state, cardId);
			errors.push({
				cardId,
				title: derivedArticle?.headline || derivedArticle?.customKicker,
				error,
			});
			return errors;
		}, []);
	};
};
