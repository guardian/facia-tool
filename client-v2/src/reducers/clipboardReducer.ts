import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/util/insertAndDedupeSiblings';
import { State as SharedState } from '../shared/types/State';
import { selectArticleFragments } from 'shared/selectors/shared';
import {
  INSERT_CLIPBOARD_ARTICLE_FRAGMENT,
  REMOVE_CLIPBOARD_ARTICLE_FRAGMENT,
  UPDATE_CLIPBOARD_CONTENT,
  CLEAR_CLIPBOARD
} from 'actions/Clipboard';

type State = string[];

const clipboard = (
  state: State = [],
  action: Action,
  prevSharedState: SharedState
): State => {
  switch (action.type) {
    case UPDATE_CLIPBOARD_CONTENT: {
      const { payload } = action;
      return payload;
    }
    case REMOVE_CLIPBOARD_ARTICLE_FRAGMENT: {
      return state.filter(id => id !== action.payload.articleFragmentId);
    }
    case INSERT_CLIPBOARD_ARTICLE_FRAGMENT: {
      return insertAndDedupeSiblings(
        state,
        [action.payload.articleFragmentId],
        action.payload.index,
        selectArticleFragments(prevSharedState)
      );
    }
    case CLEAR_CLIPBOARD: {
      return [];
    }
    default: {
      return state;
    }
  }
};

export default clipboard;
