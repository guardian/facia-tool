import { Action } from '../types/Action';
import { Group } from '../types/Collection';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';

interface State {
  [id: string]: Group;
}

const groups = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'SHARED/GROUPS_RECEIVED': {
      const { payload } = action;
      return {
        ...state,
        ...payload
      };
    }
    case 'SHARED/REMOVE_ARTICLE_FRAGMENT': {
      const { id, parentType, articleFragmentId } = action.payload;
      if (parentType !== 'group') {
        return state;
      }
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
    case 'SHARED/INSERT_ARTICLE_FRAGMENT': {
      const {
        to: { id: toId, type: toType, index },
        id,
        articleFragmentMap
      } = action.payload;
      if (toType !== 'group') {
        return state;
      }
      const group = state[toId];
      const articleFragments = insertAndDedupeSiblings(
        group.articleFragments || [],
        [id],
        index,
        articleFragmentMap
      );

      return {
        ...state,
        [toId]: {
          ...group,
          articleFragments
        }
      };
    }
    default: {
      return state;
    }
  }
};

export default groups;
