// @flow

import type { ThunkAction } from 'types/Store';
import type { Action } from 'types/Action';
import { getClipboard, getArticles } from 'services/faciaApi';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';

function fetchClipboardContentSuccess(clipboardContent: Array<string>): Action {
  return {
    type: 'FETCH_CLIPBOARD_CONTENT_SUCCESS',
    payload: {
      clipboardContent
    }
  };
}

function fetchClipboardContent(): ThunkAction {
  return (dispatch: Dispatch) =>
    getClipboard()
      .then(clipboardContent => {
        dispatch(fetchClipboardContentSuccess(clipboardContent));
        return getArticles(clipboardContent).catch(error =>
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

export { fetchClipboardContent };
