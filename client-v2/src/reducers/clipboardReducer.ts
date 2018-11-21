import { Action } from 'types/Action';
import { insertAndDedupeSiblings } from 'shared/util/insertAndDedupeSiblings';

type State = string[];

const clipboard = (state: State = [], action: Action): State => {
  switch (action.type) {
    case 'UPDATE_CLIPBOARD_CONTENT': {
      const { payload } = action;
      return payload;
    }
    case 'SHARED/REMOVE_ARTICLE_FRAGMENT': {
      const { articleFragmentId, parentType } = action.payload;
      return parentType !== 'clipboard'
        ? state
        : state.filter(id => id !== articleFragmentId);
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
