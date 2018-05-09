// @flow

import { type Action } from 'types/Action';

type State = Object;

const collectionArticles = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'CAPI_ARTICLES_RECEIVED': {
      const { id, payload } = action;
      return Object.assign({}, state, { [id]: payload });
    }
    default: {
      return state;
    }
  }
};

export default collectionArticles;
