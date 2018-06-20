// @flow

import type { ThunkAction } from 'types/Store';
import type { Action } from 'types/Action';
import { getClipboard } from 'services/faciaApi';

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
      .then(clipboardContent =>
        dispatch(fetchClipboardContentSuccess(clipboardContent))
      )
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

export { fetchClipboardContent };
