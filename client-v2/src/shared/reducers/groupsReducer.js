// @flow

import { type Action } from '../types/Action';
import { type Group } from '../types/Collection';

type State = {
  [string]: Group
};

const groups = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/GROUPS_RECEIVED': {
      const { payload } = action;
      return {
        ...state,
        ...payload
      };
    }
    case 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT': {
      const { id, articleFragmentId } = action.payload;
      const group = state[id];
      return {
        ...state,
        [id]: {
          ...group,
          articleFragments: (group.articleFragments || []).filter(
            afId => afId !== articleFragmentId
          )
        }
      };
    }
    case 'SHARED/ADD_GROUP_ARTICLE_FRAGMENT': {
      const { id, index, articleFragmentId } = action.payload;
      const group = state[id];

      return {
        ...state,
        [id]: {
          ...group,
          articleFragments: [
            ...(group.articleFragments || []).slice(0, index),
            articleFragmentId,
            ...(group.articleFragments || []).slice(index)
          ]
        }
      };
    }
    default: {
      return state;
    }
  }
};

export default groups;
