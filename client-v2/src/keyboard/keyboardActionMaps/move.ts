import Raven from 'raven-js';
import { KeyboardActionMap, ApplicationFocusStates } from 'keyboard';
import { Dispatch } from 'types/Store';
import { keyboardArticleFragmentMove } from 'actions/KeyboardNavigation';

const moveUp: KeyboardActionMap = {
  clipboardArticle: (focusData: ApplicationFocusStates) => async (
    dispatch: Dispatch
  ) => {
    try {
      dispatch(
        keyboardArticleFragmentMove(
          'up',
          'clipboard',
          focusData.articleFragment
        )
      );
    } catch (e) {
      Raven.captureMessage(`Moving item up in clipboard failed: ${e.message}`);
    }
  }
};

const moveDown: KeyboardActionMap = {
  clipboardArticle: (focusData: ApplicationFocusStates) => async (
    dispatch: Dispatch
  ) => {
    try {
      dispatch(
        keyboardArticleFragmentMove(
          'down',
          'clipboard',
          focusData.articleFragment
        )
      );
    } catch (e) {
      Raven.captureMessage(`Moving item up in clipboard failed: ${e.message}`);
    }
  }
};

export { moveUp, moveDown };
