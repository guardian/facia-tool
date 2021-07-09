import Raven from 'raven-js';
import { KeyboardActionMap, ApplicationFocusStates } from 'keyboard';
import { Dispatch } from 'types/Store';
import { keyboardCardMove } from 'actions/KeyboardNavigation';

const moveUp: KeyboardActionMap = {
  clipboardArticle:
    (focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
      try {
        dispatch(keyboardCardMove('up', 'clipboard', focusData.card));
      } catch (e) {
        Raven.captureMessage(
          `Moving item up in clipboard failed: ${e.message}`
        );
      }
    },
  collectionArticle:
    (focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
      try {
        dispatch(
          keyboardCardMove(
            'up',
            'collection',
            focusData.card,
            focusData.groupId,
            focusData.frontId
          )
        );
      } catch (e) {
        Raven.captureMessage(
          `Moving item up in clipboard failed: ${e.message}`
        );
      }
    },
};

const moveDown: KeyboardActionMap = {
  clipboardArticle:
    (focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
      try {
        dispatch(keyboardCardMove('down', 'clipboard', focusData.card));
      } catch (e) {
        Raven.captureMessage(
          `Moving item down in clipboard failed: ${e.message}`
        );
      }
    },
  collectionArticle:
    (focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
      try {
        dispatch(
          keyboardCardMove(
            'down',
            'collection',
            focusData.card,
            focusData.groupId,
            focusData.frontId
          )
        );
      } catch (e) {
        Raven.captureMessage(
          `Moving item down in clipboard failed: ${e.message}`
        );
      }
    },
};

export { moveUp, moveDown };
