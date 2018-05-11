// @flow

import { type Action } from '../types/Action';
import type { Collection } from '../types/Shared';

type State = {
  [string]: Collection
};

const collections = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/COLLECTION_RECEIVED': {
      const { payload } = action;
      return Object.assign({}, state, { [payload.id]: payload });
    }
    default: {
      return state;
    }
  }
};

export default collections;
