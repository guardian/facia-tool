import { Action } from '../types/Action';
import { insertAndDedupeSiblings } from '../util/insertAndDedupeSiblings';
import { State } from './sharedReducer';
import {
  articleFragmentsSelector,
  groupSiblingsSelector
} from 'shared/selectors/shared';
import { capGroupArticleFragments } from 'shared/util/capGroupArticleFragments';
import keyBy from 'lodash/keyBy';

const getUpdatedSiblingGroupsForInsertion = (
  sharedState: State,
  groupsState: State['groups'],
  insertionGroupId: string,
  insertionIndex: number,
  articleFragmentId: string
) => {
  const articleFragmentsMap = articleFragmentsSelector(sharedState);
  const groupSiblings = groupSiblingsSelector(sharedState, insertionGroupId);

  if (!articleFragmentsMap[articleFragmentId]) {
    // this may have happened if we've purged after a poll
    return groupsState;
  }

  return groupSiblings.reduce(
    (acc, sibling) => ({
      ...acc,
      [sibling.uuid]: {
        ...sibling,
        articleFragments: insertAndDedupeSiblings(
          sibling.articleFragments || [],
          [articleFragmentId],
          insertionIndex,
          articleFragmentsMap,
          sibling.uuid === insertionGroupId // this means no insertions happen here if it's not this group
        )
      }
    }),
    {} as State['groups']
  );
};

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
      return {
        ...state,
        ...getUpdatedSiblingGroupsForInsertion(
          prevSharedState,
          state,
          id,
          index,
          articleFragmentId
        )
      };
    }
    case 'SHARED/CAP_GROUP_SIBLINGS': {
      const { id, collectionCap } = action.payload;
      const groupSiblings = groupSiblingsSelector(prevSharedState, id);
      const cappedSiblings = keyBy(
        capGroupArticleFragments(groupSiblings, collectionCap),
        ({ uuid }) => uuid
      );

      return {
        ...state,
        ...cappedSiblings
      };
    }
    default: {
      return state;
    }
  }
};

export { getUpdatedSiblingGroupsForInsertion };

export default groups;
