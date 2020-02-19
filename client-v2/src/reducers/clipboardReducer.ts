import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/util/insertAndDedupeSiblings';
import {
  INSERT_CLIPBOARD_CARD,
  REMOVE_CLIPBOARD_CARD,
  UPDATE_CLIPBOARD_CONTENT,
  CLEAR_CLIPBOARD
} from 'actions/Clipboard';

type State = string[];

const clipboard = (state: State = [], action: Action): State => {

  console.log("STATE IN clipBOARD REDUCER ====>", state);
  console.log("ACTION type IN clipBOARD REDUCER ====>", action.type);


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
        action.payload.currentCards
      );
    }
    case CLEAR_CLIPBOARD: {
      return [];
    }
    default: {
      console.log("DEFAULT CASE IN clipBOARD REDUCER HIT")
      return state;
    }
  }
};

export default clipboard;
