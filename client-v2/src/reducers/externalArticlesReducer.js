// @flow

import { type Action } from '../types/Action';

type State = Object;

const externalArticles = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/EXTERNAL_ARTICLES_RECEIVED': {
      const { id, payload } = action;
      return Object.assign({}, state, { [id]: payload });
    }
    default: {
      return state;
    }
  }
};

export default externalArticles;
