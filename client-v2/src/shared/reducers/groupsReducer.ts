import { Action } from '../types/Action';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
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
    case 'SHARED/INSERT_GROUP_ARTICLE_FRAGMENT': {
      const { id, index, articleFragmentId } = action.payload;
      const group = state[id];
      const articleFragmentsMap = articleFragmentsSelector(prevSharedState);
      const groupSiblings = groupSiblingsSelector(prevSharedState, id);
      const dedupedSiblings = groupSiblings.reduce(
        (acc, sibling) => ({
          ...acc,
          [sibling.uuid]: {
            ...sibling,
            articleFragments: insertAndDedupeSiblings(
              sibling.articleFragments || [],
              [articleFragmentId],
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
        [id]: {
          ...group,
          articleFragments: insertAndDedupeSiblings(
            group.articleFragments || [],
            [articleFragmentId],
            index,
            articleFragmentsMap
          )
        }
      };
    }
    default: {
      return state;
    }
  }
};

export default groups;
