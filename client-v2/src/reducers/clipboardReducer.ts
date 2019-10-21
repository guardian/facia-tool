import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/util/insertAndDedupeSiblings';
import { State as SharedState } from '../shared/types/State';
import { selectCards } from 'shared/selectors/shared';
import {
  INSERT_CLIPBOARD_CARD,
  REMOVE_CLIPBOARD_CARD,
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
    case REMOVE_CLIPBOARD_CARD: {
      return state.filter(id => id !== action.payload.cardId);
    }
    case INSERT_CLIPBOARD_CARD: {
      return insertAndDedupeSiblings(
        state,
        [action.payload.cardId],
        action.payload.index,
        selectCards(prevSharedState)
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
