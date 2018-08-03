// @flow

import type { Group } from 'shared/types/Collection';
import type { Action } from '../types/Action';

function groupsReceived(groups: { [string]: Group }): Action {
  return {
    type: 'SHARED/GROUPS_RECEIVED',
    payload: groups
  };
}

function removeGroupArticleFragment(
  id: string,
  articleFragmentId: string
): Action {
  return {
    type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT',
    payload: {
      id,
      articleFragmentId
    }
  };
}

function addGroupArticleFragment(
  id: string,
  articleFragmentId: string,
  index: number
): Action {
  return {
    type: 'SHARED/ADD_GROUP_ARTICLE_FRAGMENT',
    payload: {
      id,
      articleFragmentId,
      index
    }
  };
}

export { groupsReceived, removeGroupArticleFragment, addGroupArticleFragment };
