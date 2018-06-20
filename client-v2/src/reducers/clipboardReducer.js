// @flow

import type { Action } from 'types/Action';

type State = {
  [string]: boolean
};

const clipboard = (state: State = {}, action: Action): State => {
  switch (action.type) {
    case 'FETCH_CLIPBOARD_CONTENT_SUCCESS': {
      const { payload } = action;
      return { ...state, ...payload };
    }
    default: {
      return state;
    }
  }
};

export default clipboard;
