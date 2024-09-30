import Raven from 'raven-js';
import { KeyboardActionMap, ApplicationFocusStates } from 'keyboard';
import { Dispatch } from 'types/Store';
import { keyboardCardMove } from 'actions/KeyboardNavigation';
import { attemptFriendlyErrorMessage } from 'util/error';

const moveUp: KeyboardActionMap = {
	clipboardArticle:
		(focusData: ApplicationFocusStates) => async (dispatch: Dispatch) => {
			try {
				dispatch(keyboardCardMove('up', 'clipboard', focusData.card));
			} catch (e) {
				Raven.captureMessage(
					`Moving item up in clipboard failed: ${attemptFriendlyErrorMessage(
						e,
					)}`,
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
						focusData.frontId,
					),
				);
			} catch (e) {
				Raven.captureMessage(
					`Moving item up in clipboard failed: ${attemptFriendlyErrorMessage(
						e,
					)}`,
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
					`Moving item down in clipboard failed: ${attemptFriendlyErrorMessage(
						e,
					)}`,
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
						focusData.frontId,
					),
				);
			} catch (e) {
				Raven.captureMessage(
					`Moving item down in clipboard failed: ${attemptFriendlyErrorMessage(
						e,
					)}`,
				);
			}
		},
};

export { moveUp, moveDown };
