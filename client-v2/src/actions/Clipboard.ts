import { Dispatch, ThunkResult } from 'types/Store';
import { saveClipboardStrategy } from 'strategies/save-clipboard';
import { fetchArticles } from 'actions/Collections';
import { batchActions } from 'redux-batched-actions';
import { cardsReceived } from 'shared/actions/Cards';
import {
  Card,
  NestedCard
} from 'shared/types/Collection';
import { normaliseClipboard } from 'util/clipboardUtils';
import {
  UpdateClipboardContent,
  InsertClipboardCard,
  RemoveClipboardCard,
  ClearClipboard
} from 'types/Action';
import { State } from 'types/State';
import { addPersistMetaToAction } from 'util/action';

export const REMOVE_CLIPBOARD_ARTICLE_FRAGMENT =
  'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT';
export const UPDATE_CLIPBOARD_CONTENT = 'UPDATE_CLIPBOARD_CONTENT';
export const INSERT_CLIPBOARD_ARTICLE_FRAGMENT =
  'INSERT_CLIPBOARD_ARTICLE_FRAGMENT';
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

    const fragmentIds = Object.values(cards).map(
      fragment => fragment.id
    );
    return dispatch(fetchArticles(fragmentIds));
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

const insertClipboardCard = (
  id: string,
  index: number,
  cardId: string
): InsertClipboardCard => ({
  type: INSERT_CLIPBOARD_ARTICLE_FRAGMENT,
  payload: {
    id,
    index,
    cardId
  }
});

const insertClipboardCardWithPersist = addPersistMetaToAction(
  insertClipboardCard,
  {
    persistTo: 'clipboard',
    key: 'cardId'
  }
);

const removeClipboardCard = (
  id: string,
  cardId: string
): RemoveClipboardCard => ({
  type: REMOVE_CLIPBOARD_ARTICLE_FRAGMENT,
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
  insertClipboardCard,
  insertClipboardCardWithPersist,
  removeClipboardCard,
  clearClipboard,
  clearClipboardWithPersist
};
