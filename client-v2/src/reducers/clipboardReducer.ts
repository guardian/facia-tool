import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/util/insertAndDedupeSiblings';
import { State as SharedState } from '../shared/types/State';
import { articleFragmentsSelector } from 'shared/selectors/shared';
import {
  INSERT_CLIPBOARD_ARTICLE_FRAGMENT,
  REMOVE_CLIPBOARD_ARTICLE_FRAGMENT,
  UPDATE_CLIPBOARD_CONTENT
} from 'actions/Clipboard';

interface State {
  frontsClipboard: string[];
  editionsClipboard: string[];
}

const clipboard = (
  state: State = { frontsClipboard: [], editionsClipboard: [] },
  action: Action,
  prevSharedState: SharedState
): State => {
  switch (action.type) {
    case UPDATE_CLIPBOARD_CONTENT: {
      const { payload } = action;
      return payload;
    }
    case REMOVE_CLIPBOARD_ARTICLE_FRAGMENT: {
      if (action.payload.clipboardType === 'fronts') {
        return {
          ...state,
          ...{
            frontsClipboard: state.frontsClipboard.filter(
              id => id !== action.payload.articleFragmentId
            )
          }
        };
      }
      if (action.payload.clipboardType === 'editions') {
        return {
          ...state,
          ...{
            editionsClipboard: state.editionsClipboard.filter(
              id => id !== action.payload.articleFragmentId
            )
          }
        };
      }
      return state;
    }

    case INSERT_CLIPBOARD_ARTICLE_FRAGMENT: {
      if (action.payload.clipboardType === 'fronts') {
        const newFrontsClipboard = insertAndDedupeSiblings(
          state.frontsClipboard,
          [action.payload.articleFragmentId],
          action.payload.index,
          articleFragmentsSelector(prevSharedState)
        );
        return { ...state, frontsClipboard: newFrontsClipboard };
      }

      if (action.payload.clipboardType === 'editions') {
        const newEditionsClipboard = insertAndDedupeSiblings(
          state.editionsClipboard,
          [action.payload.articleFragmentId],
          action.payload.index,
          articleFragmentsSelector(prevSharedState)
        );
        return { ...state, editionsClipboard: newEditionsClipboard };
      }

      return state;
    }

    default: {
      return state;
    }
  }
};

export default clipboard;
