

import type { Action } from 'types/Action';

type State = {
  [string]: boolean
};

const unpublishedChanges = (state: State = {}, action: Action): State => {
  switch (action.type) {
    case 'RECORD_UNPUBLISHED_CHANGES': {
      const { payload } = action;
      return { ...state, ...payload };
    }
    default: {
      return state;
    }
  }
};

export default unpublishedChanges;
