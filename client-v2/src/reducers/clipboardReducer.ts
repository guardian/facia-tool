import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/reducers/utils';

type State = string[];

const clipboard = (state: State = [], action: Action): State => {
  switch (action.type) {
    case 'UPDATE_CLIPBOARD_CONTENT': {
      const { payload } = action;
      return payload;
    }
    case 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT': {
      const { articleFragmentId } = action.payload;
      return state.filter(id => id !== articleFragmentId);
    }
    case 'SHARED/INSERT_ARTICLE_FRAGMENT': {
      const {
        to: { type: toType, index },
        id,
        articleFragmentMap
      } = action.payload;
      if (toType !== 'clipboard') {
        return state;
      }
      return insertAndDedupeSiblings(state, [id], index, articleFragmentMap);
    }

    default: {
      return state;
    }
  }
};

export default clipboard;
