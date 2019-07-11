import { moveArticleFragment } from 'actions/ArticleFragments';
import {
  selectNextIndexAndGroup,
  selectNextClipboardIndexSelector
} from '../selectors/keyboardNavigationSelectors';
import {
  selectSharedState,
  selectIndexInGroup
} from 'shared/selectors/shared';
import { ArticleFragment } from 'shared/types/Collection';
import { PosSpec } from 'lib/dnd';
import { ThunkResult, Dispatch } from 'types/Store';
import { setFocusState } from 'bundles/focusBundle';
import { editorOpenCollections } from 'bundles/frontsUIBundle';

const keyboardArticleFragmentMove = (
  action: 'up' | 'down',
  persistTo: 'collection' | 'clipboard',
  fragment?: ArticleFragment,
  groupId?: string,
  frontId?: string
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    if (!fragment) {
      return;
    }

    const state = getState();
    const id = fragment.uuid;
    if (persistTo === 'collection') {
      const fromIndex = selectIndexInGroup(
        selectSharedState(state),
        groupId || '',
        id
      );
      const type = 'group';

      const from: PosSpec = { type, index: fromIndex, id: groupId || '' };

      const nextPosition = selectNextIndexAndGroup(
        state,
        groupId || '',
        id,
        action,
        frontId || ''
      );

      if (nextPosition && nextPosition.nextGroupId) {
        const { toIndex, nextGroupId, collectionId } = nextPosition;

        // If we are moving between collections we should open the collection first
        if (collectionId) {
          dispatch(editorOpenCollections(collectionId));
        }

        const to: PosSpec = { type, index: toIndex, id: nextGroupId };
        dispatch(moveArticleFragment(to, fragment, from, persistTo));
        dispatch(
          setFocusState({
            type: 'collectionArticle',
            groupId: nextGroupId,
            articleFragment: fragment,
            frontId
          })
        );
      }
    } else if (persistTo === 'clipboard') {
      const clipboardIndeces = selectNextClipboardIndexSelector(state, id, action);
      if (clipboardIndeces) {
        const { fromIndex, toIndex } = clipboardIndeces;
        const type = 'clipboard';
        const from = { type, index: fromIndex, id: 'clipboard' };
        const to = { type, index: toIndex, id: 'clipboard' };
        dispatch(moveArticleFragment(to, fragment, from, persistTo));
      }
    }
  };
};

export { keyboardArticleFragmentMove };
