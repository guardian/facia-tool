import { Dispatch, ThunkResult } from 'types/Store';
import { saveClipboardStrategy } from 'strategies/save-clipboard';
import { fetchArticles } from 'actions/Collections';
import { batchActions } from 'redux-batched-actions';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import {
  ArticleFragment,
  NestedArticleFragment
} from 'shared/types/Collection';
import { normaliseClipboard } from 'util/clipboardUtils';
import {
  UpdateClipboardContent,
  InsertClipboardArticleFragment,
  RemoveClipboardArticleFragment,
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

function storeClipboardContent(clipboardContent: NestedArticleFragment[]) {
  return (dispatch: Dispatch) => {
    const normalisedClipboard: {
      clipboard: { articles: string[] };
      articleFragments: { [id: string]: ArticleFragment };
    } = normaliseClipboard({
      articles: clipboardContent
    });
    const clipboardArticles = normalisedClipboard.clipboard.articles;
    const { articleFragments } = normalisedClipboard;

    dispatch(
      batchActions([
        updateClipboardContent(clipboardArticles),
        articleFragmentsReceived(articleFragments)
      ])
    );

    const fragmentIds = Object.values(articleFragments).map(
      fragment => fragment.id
    );
    return dispatch(fetchArticles(fragmentIds));
  };
}

function updateClipboard(clipboardContent: {
  articles: NestedArticleFragment[];
}): ThunkResult<Promise<NestedArticleFragment[]>> {
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

const insertClipboardArticleFragment = (
  id: string,
  index: number,
  articleFragmentId: string
): InsertClipboardArticleFragment => ({
  type: INSERT_CLIPBOARD_ARTICLE_FRAGMENT,
  payload: {
    id,
    index,
    articleFragmentId
  }
});

const removeClipboardArticleFragment = (
  id: string,
  articleFragmentId: string
): RemoveClipboardArticleFragment => ({
  type: REMOVE_CLIPBOARD_ARTICLE_FRAGMENT,
  payload: {
    id,
    articleFragmentId
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
  insertClipboardArticleFragment,
  removeClipboardArticleFragment,
  clearClipboard,
  clearClipboardWithPersist
};
