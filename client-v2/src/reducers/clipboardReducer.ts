import { Action } from 'types/Action';

type State = Array<string>;

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
    case 'ADD_CLIPBOARD_ARTICLE_FRAGMENT': {
      const { index, articleFragmentId } = action.payload;
      return [
        ...state.slice(0, index),
        articleFragmentId,
        ...state.slice(index)
      ];
    }

    default: {
      return state;
    }
  }
};

export default clipboard;
