import { Dispatch, ThunkResult } from 'types/Store';
import { saveClipboard } from 'services/faciaApi';
import { fetchArticles } from 'actions/Collections';
import { batchActions } from 'redux-batched-actions';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { NestedArticleFragment } from 'shared/types/Collection';
import { normaliseClipboard } from 'util/clipboardUtils';
import {
  UpdateClipboardContent,
  InsertClipboardArticleFragment,
  RemoveClipboardArticleFragment
} from 'types/Action';
import { ClipboardType } from 'shared/types/Clipboard';

export const REMOVE_CLIPBOARD_ARTICLE_FRAGMENT =
  'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT';
export const UPDATE_CLIPBOARD_CONTENT = 'UPDATE_CLIPBOARD_CONTENT';
export const INSERT_CLIPBOARD_ARTICLE_FRAGMENT =
  'INSERT_CLIPBOARD_ARTICLE_FRAGMENT';

function updateClipboardContent(clipboardContent: {
  frontsClipboard: string[];
  editionsClipboard: string[];
}): UpdateClipboardContent {
  return {
    type: UPDATE_CLIPBOARD_CONTENT,
    payload: clipboardContent
  };
}

function storeClipboardContent(clipboardContent: {
  frontsClipboard: NestedArticleFragment[];
  editionsClipboard: NestedArticleFragment[];
}) {
  return (dispatch: Dispatch) => {
    const normalisedClipboard = normaliseClipboard(clipboardContent);
    const { frontsClipboard } = normalisedClipboard;
    const { editionsClipboard } = normalisedClipboard;
    const clipboardArticles: {
      frontsClipboard: string[];
      editionsClipboard: string[];
    } = { frontsClipboard, editionsClipboard };
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
  frontsClipboard: NestedArticleFragment[];
  editionsClipboard: NestedArticleFragment[];
}): ThunkResult<Promise<NestedArticleFragment[] | void>> {
  return () => {
    return saveClipboard(clipboardContent).catch(() => {
      // @todo: implement once error handling is done
    });
  };
}

const insertClipboardArticleFragment = (
  id: string,
  index: number,
  articleFragmentId: string,
  type?: ClipboardType
): InsertClipboardArticleFragment => {
  const clipboardType = type;
  return {
    type: INSERT_CLIPBOARD_ARTICLE_FRAGMENT,
    payload: {
      id,
      index,
      articleFragmentId,
      clipboardType
    }
  };
};

const removeClipboardArticleFragment = (
  id: string,
  articleFragmentId: string,
  type?: ClipboardType
): RemoveClipboardArticleFragment => {
  const clipboardType = type;
  return {
    type: REMOVE_CLIPBOARD_ARTICLE_FRAGMENT,
    payload: {
      id,
      articleFragmentId,
      clipboardType
    }
  };
};

export {
  storeClipboardContent,
  updateClipboard,
  updateClipboardContent,
  insertClipboardArticleFragment,
  removeClipboardArticleFragment
};
