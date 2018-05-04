// @flow

import { type Action } from '../types/Action';
import { type Collection } from '../types/Collection';

type State = {
  [string]: Collection
};

const collections = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'FRONTS_COLLECTION_RECEIVED': {
      const { id, payload } = action;
      return Object.assign({}, state, { [id]: payload });
    }
    default: {
      return state;
    }
  }
};

export default collections;
