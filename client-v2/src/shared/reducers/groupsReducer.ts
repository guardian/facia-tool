import { Action } from '../types/Action';
import { Group } from '../types/Collection';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import {
  handleRemoveArticleFragment,
  handleInsertArticleFragment
} from 'shared/util/articleFragmentHandlers';

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
      return handleRemoveArticleFragment(
        state,
        action,
        'group',
        (id, articleFragmentId) => {
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
      );
    }
    case 'SHARED/INSERT_ARTICLE_FRAGMENT': {
      return handleInsertArticleFragment(
        state,
        action,
        'group',
        (toId, id, index, articleFragmentMap) => {
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
      );
    }
    default: {
      return state;
    }
  }
};

export default groups;
