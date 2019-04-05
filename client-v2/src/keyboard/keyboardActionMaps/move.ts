import Raven from 'raven-js';
import { KeyboardActionMap, ApplicationFocusStates } from 'keyboard';
import { Dispatch } from 'types/Store';
import { keyboardArticleFragmentMove } from 'actions/ArticleFragments';

const moveUp: KeyboardActionMap = {
  clipboardArticle: (focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
    try {
      dispatch(keyboardArticleFragmentMove(focusData.articleFragment, 'up', 'clipboard'));

    } catch (e) {
      Raven.captureMessage(`Moving item up in clipboard failed: ${e.message}`);
    }
  }
}

const moveDown: KeyboardActionMap = {
  clipboardArticle: (focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
    try {
      dispatch(keyboardArticleFragmentMove(focusData.articleFragment, 'down', 'clipboard'));

    } catch (e) {
      Raven.captureMessage(`Moving item up in clipboard failed: ${e.message}`);
    }
  }
}

export { moveUp, moveDown }
