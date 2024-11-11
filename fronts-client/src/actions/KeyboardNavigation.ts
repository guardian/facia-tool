import { moveCard } from 'actions/Cards';
import {
	selectNextIndexAndGroup,
	selectNextClipboardIndexSelector,
} from '../selectors/keyboardNavigationSelectors';
import { selectIndexInGroup } from 'selectors/shared';
import { Card } from 'types/Collection';
import { PosSpec } from 'lib/dnd';
import { ThunkResult, Dispatch } from 'types/Store';
import { setFocusState } from 'bundles/focusBundle';
import { editorOpenCollections } from 'bundles/frontsUI';

const keyboardCardMove = (
	action: 'up' | 'down',
	persistTo: 'collection' | 'clipboard',
	card?: Card,
	groupId?: string,
	frontId?: string,
): ThunkResult<void> => {
	return (dispatch: Dispatch, getState) => {
		if (!card) {
			return;
		}

		const state = getState();
		const id = card.uuid;
		if (persistTo === 'collection') {
			const fromIndex = selectIndexInGroup(state, groupId || '', id);
			const type = 'group';

			const from: PosSpec = { type, index: fromIndex, id: groupId || '' };

			const nextPosition = selectNextIndexAndGroup(
				state,
				groupId || '',
				id,
				action,
				frontId || '',
			);

			if (nextPosition && nextPosition.nextGroupId) {
				const { toIndex, nextGroupId, collectionId } = nextPosition;

				// If we are moving between collections we should open the collection first
				if (collectionId) {
					dispatch(editorOpenCollections(collectionId));
				}

				const to: PosSpec = { type, index: toIndex, id: nextGroupId };
				dispatch(moveCard(to, card, from, persistTo));
				dispatch(
					setFocusState({
						type: 'collectionArticle',
						groupId: nextGroupId,
						card,
						frontId,
					}),
				);
			}
		} else if (persistTo === 'clipboard') {
			const clipboardIndeces = selectNextClipboardIndexSelector(
				state,
				id,
				action,
			);
			if (clipboardIndeces) {
				const { fromIndex, toIndex } = clipboardIndeces;
				const type = 'clipboard';
				const from = { type, index: fromIndex, id: 'clipboard' };
				const to = { type, index: toIndex, id: 'clipboard' };
				dispatch(moveCard(to, card, from, persistTo));
			}
		}
	};
};

export { keyboardCardMove };
