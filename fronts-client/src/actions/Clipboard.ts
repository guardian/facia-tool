import { Dispatch, ThunkResult } from 'types/Store';
import { saveClipboardStrategy } from 'strategies/save-clipboard';
import { fetchArticles } from 'actions/Collections';
import { batchActions } from 'redux-batched-actions';
import { cardsReceived } from 'actions/CardsCommon';
import { Card, NestedCard } from 'types/Collection';
import { normaliseClipboard } from 'util/clipboardUtils';
import {
  UpdateClipboardContent,
  InsertClipboardCard,
  RemoveClipboardCard,
  ClearClipboard
} from 'types/Action';
import { State } from 'types/State';
import { addPersistMetaToAction } from 'util/action';
import { selectCards } from 'selectors/shared';

export const REMOVE_CLIPBOARD_CARD = 'REMOVE_CLIPBOARD_CARD';
export const UPDATE_CLIPBOARD_CONTENT = 'UPDATE_CLIPBOARD_CONTENT';
export const INSERT_CLIPBOARD_CARD = 'INSERT_CLIPBOARD_CARD';
export const CLEAR_CLIPBOARD = 'CLEAR_CLIPBOARD';

function updateClipboardContent(
  clipboardContent: string[] = []
): UpdateClipboardContent {
  return {
    type: UPDATE_CLIPBOARD_CONTENT,
    payload: clipboardContent
  };
}

function storeClipboardContent(clipboardContent: NestedCard[]) {
  return (dispatch: Dispatch) => {
    const normalisedClipboard: {
      clipboard: { articles: string[] };
      cards: { [id: string]: Card };
    } = normaliseClipboard({
      articles: clipboardContent
    });
    const clipboardArticles = normalisedClipboard.clipboard.articles;
    const { cards } = normalisedClipboard;

    dispatch(
      batchActions([
        updateClipboardContent(clipboardArticles),
        cardsReceived(cards)
      ])
    );

    const cardIds = Object.values(cards).map(card => card.id);
    return dispatch(fetchArticles(cardIds));
  };
}

function updateClipboard(clipboardContent: {
  articles: NestedCard[];
}): ThunkResult<Promise<NestedCard[]>> {
  return async (_, getState: () => State) => {
    const saveClipboardResponse = await saveClipboardStrategy(
      getState(),
      clipboardContent.articles
    );
    if (!saveClipboardResponse) {
      // @todo: implement once error handling is done
      return Promise.resolve([]);
    }
    return saveClipboardResponse;
  };
}

const actionInsertClipboardCard = (
  id: string,
  index: number,
  cardId: string,
  currentCards: { [uuid: string]: Card }
): InsertClipboardCard => ({
  type: INSERT_CLIPBOARD_CARD,
  payload: {
    id,
    index,
    cardId,
    currentCards
  }
});

const actionInsertClipboardCardWithPersist = addPersistMetaToAction(
  actionInsertClipboardCard,
  {
    persistTo: 'clipboard',
    key: 'cardId'
  }
);

const thunkInsertClipboardCard = (
  id: string,
  index: number,
  cardId: string
): ThunkResult<void> => (dispatch, getState) => {
  const currentCards = selectCards(getState());
  dispatch(
    actionInsertClipboardCardWithPersist(id, index, cardId, currentCards)
  );
};

const removeClipboardCard = (
  id: string,
  cardId: string
): RemoveClipboardCard => ({
  type: REMOVE_CLIPBOARD_CARD,
  payload: {
    id,
    cardId
  }
});

const clearClipboard = (id: string): ClearClipboard => ({
  type: CLEAR_CLIPBOARD,
  payload: {
    id
  }
});

const clearClipboardWithPersist = addPersistMetaToAction(clearClipboard, {
  persistTo: 'clipboard'
});

export {
  storeClipboardContent,
  updateClipboard,
  updateClipboardContent,
  thunkInsertClipboardCard,
  removeClipboardCard,
  clearClipboard,
  clearClipboardWithPersist
};
