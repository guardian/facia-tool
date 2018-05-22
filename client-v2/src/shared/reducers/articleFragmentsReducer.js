// @flow

import { type Action } from '../types/Action';
import { type ArticleFragment } from '../types/Collection';

type State = {
  [string]: ArticleFragment
};

const articleFragments = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/ARTICLE_FRAGMENTS_RECEIVED': {
      const { payload } = action;
      return Object.assign({}, state, payload);
    }
    default: {
      return state;
    }
  }
};

export default articleFragments;
