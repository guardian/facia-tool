import type { Dispatch, ThunkResult } from 'types/Store';
import type { Card, NestedCard } from 'types/Collection';
import type { State } from 'types/State';
import { saveClipboardStrategy } from 'strategies/save-clipboard';
import { fetchCardReferencedEntitiesForCards } from 'actions/Collections';
import { batchActions } from 'redux-batched-actions';
import { cardsReceived } from 'actions/CardsCommon';
import { normaliseClipboard } from 'util/clipboardUtils';
import {
	updateClipboardContent,
	actionInsertClipboardCardWithPersist,
} from './Clipboard';
import { selectCardMap } from 'selectors/shared';

export const thunkInsertClipboardCard =
	(id: string, index: number, cardId: string): ThunkResult<void> =>
	(dispatch, getState) => {
		const currentCards = selectCardMap(getState());
		dispatch(
			actionInsertClipboardCardWithPersist(id, index, cardId, currentCards),
		);
	};

export function storeClipboardContent(clipboardContent: NestedCard[]) {
	return (dispatch: Dispatch) => {
		const normalisedClipboard: {
			clipboard: { articles: string[] };
			cards: { [id: string]: Card };
		} = normaliseClipboard({
			articles: clipboardContent,
		});
		const clipboardArticles = normalisedClipboard.clipboard.articles;
		const { cards } = normalisedClipboard;

		dispatch(
			batchActions([
				updateClipboardContent(clipboardArticles),
				cardsReceived(cards),
			]),
		);

		const cardIds = Object.values(cards).map((card) => card.uuid);
		return dispatch(fetchCardReferencedEntitiesForCards(cardIds));
	};
}

export function updateClipboard(clipboardContent: {
	articles: NestedCard[];
}): ThunkResult<Promise<NestedCard[]>> {
	return async (_, getState: () => State) => {
		const saveClipboardResponse = await saveClipboardStrategy(
			getState(),
			clipboardContent.articles,
		);
		if (!saveClipboardResponse) {
			// @todo: implement once error handling is done
			return Promise.resolve([]);
		}
		return saveClipboardResponse;
	};
}
