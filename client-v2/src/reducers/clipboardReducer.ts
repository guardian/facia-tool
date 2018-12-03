import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/util/insertAndDedupeSiblings';
import {
  handleInsertArticleFragment,
  handleRemoveArticleFragment
} from 'shared/util/articleFragmentHandlers';
import { State as SharedState } from '../shared/types/State';
import { articleFragmentsSelector } from 'shared/selectors/shared';

type State = string[];

const clipboard = (
  state: State = [],
  action: Action,
  prevSharedState: SharedState
): State => {
  switch (action.type) {
    case 'UPDATE_CLIPBOARD_CONTENT': {
      const { payload } = action;
      return payload;
    }
    case 'SHARED/REMOVE_ARTICLE_FRAGMENT': {
      return handleRemoveArticleFragment(
        state,
        action,
        'clipboard',
        (_, articleFragmentId) => state.filter(id => id !== articleFragmentId)
      );
    }
    case 'SHARED/INSERT_ARTICLE_FRAGMENT': {
      return handleInsertArticleFragment(
        state,
        action,
        'clipboard',
        ({ id: articleFragmentId, to: { index } }) =>
          insertAndDedupeSiblings(
            state,
            [articleFragmentId],
            index,
            articleFragmentsSelector(prevSharedState)
          )
      );
    }

    default: {
      return state;
    }
  }
};

export default clipboard;
