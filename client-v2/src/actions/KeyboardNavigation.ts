import { moveArticleFragment } from 'actions/ArticleFragments';
import {
  nextIndexAndGroupSelector,
  nextClipboardIndexSelector
} from '../selectors/keyboardNavigationSelectors';
import {
  selectSharedState,
  indexInGroupSelector
} from 'shared/selectors/shared';
import { ArticleFragment } from 'shared/types/Collection';
import { PosSpec } from 'lib/dnd';
import { ThunkResult, Dispatch } from 'types/Store';

const keyboardArticleFragmentMove = (
  action: 'up' | 'down',
  persistTo: 'collection' | 'clipboard',
  fragment?: ArticleFragment,
  groupId?: string
): ThunkResult<void> => {
  return (dispatch: Dispatch, getState) => {
    if (!fragment) {
      return;
    }

    const state = getState();
    const id = fragment.uuid;
    if (persistTo === 'collection') {
      const fromIndex = indexInGroupSelector(
        selectSharedState(state),
        groupId || '',
        id
      );
      const type = 'group';

      const from: PosSpec = { type, index: fromIndex, id: groupId || '' };

      const nextPosition = nextIndexAndGroupSelector(
        state,
        id,
        groupId || '',
        action
      );

      if (nextPosition && nextPosition.nextGroupId) {
        const { toIndex, nextGroupId } = nextPosition;

        const to: PosSpec = { type, index: toIndex, id: nextGroupId };

        dispatch(moveArticleFragment(to, fragment, from, persistTo));
      }
    } else if (persistTo === 'clipboard') {
      const clipboardIndeces = nextClipboardIndexSelector(state, id, action);
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
