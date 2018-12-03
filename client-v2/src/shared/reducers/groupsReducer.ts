import { Action } from '../types/Action';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import {
  handleRemoveArticleFragment,
  handleInsertArticleFragment
} from 'shared/util/articleFragmentHandlers';
import { State } from './sharedReducer';
import {
  articleFragmentsSelector,
  groupSiblingsSelector
} from 'shared/selectors/shared';

const groups = (
  state: State['groups'] = {},
  action: Action,
  prevSharedState: State
) => {
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
        ({ to: { id: toId, index }, id }) => {
          const group = state[toId];
          const articleFragmentsMap = articleFragmentsSelector(prevSharedState);
          const groupSiblings = groupSiblingsSelector(prevSharedState, toId);
          const dedupedSiblings = groupSiblings.reduce(
            (acc, sibling) => ({
              ...acc,
              [sibling.uuid]: {
                ...sibling,
                articleFragments: insertAndDedupeSiblings(
                  sibling.articleFragments || [],
                  [id],
                  index,
                  articleFragmentsMap,
                  true // this means no insertions happen here
                )
              }
            }),
            {} as State['groups']
          );

          return {
            ...state,
            ...dedupedSiblings,
            [toId]: {
              ...group,
              articleFragments: insertAndDedupeSiblings(
                group.articleFragments || [],
                [id],
                index,
                articleFragmentsMap
              )
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
