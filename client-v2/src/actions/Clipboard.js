// @flow

import type { ThunkAction } from 'types/Store';
import v4 from 'uuid/v4';
import type { Action } from 'types/Action';
import { getClipboard, getArticles } from 'services/faciaApi';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { batchActions } from 'redux-batched-actions';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';

function removeClipboardArticleFragment(articleFragmentId: string): Action {
  return {
    type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId
    }
  };
}

function addClipboardArticleFragment(
  articleFragmentId: string,
  index: number
): Action {
  return {
    type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId,
      index
    }
  };
}

function fetchClipboardContentSuccess(clipboardContent: Array<string>): Action {
  return {
    type: 'FETCH_CLIPBOARD_CONTENT_SUCCESS',
    payload: clipboardContent
  };
}

function fetchClipboardContent(): ThunkAction {
  return (dispatch: Dispatch) =>
    getClipboard()
      .then(clipboardContent => {
        const clipboardArticleFragments = clipboardContent.map(content => ({
          ...content,
          uuid: v4()
        }));
        const withIds = clipboardArticleFragments.reduce(
          (fragmentsWithIds, fragment) => {
            const fragmentWithId = { [fragment.uuid]: fragment };
            return { ...fragmentsWithIds, ...fragmentWithId };
          },
          {}
        );
        dispatch(
          batchActions([
            fetchClipboardContentSuccess(
              clipboardArticleFragments.map(content => content.uuid)
            ),
            articleFragmentsReceived(withIds)
          ])
        );

        return getArticles(clipboardContent.map(content => content.id)).catch(
          error =>
            dispatch(externalArticleActions.fetchError(error, clipboardContent))
        );
      })
      .then(articles => {
        dispatch(externalArticleActions.fetchSuccess(articles));
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

export {
  fetchClipboardContent,
  addClipboardArticleFragment,
  removeClipboardArticleFragment
};
