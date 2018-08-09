// @flow

import type { Group } from 'shared/types/Collection';

function groupsReceived(groups: { [string]: Group }) {
  return {
    type: 'SHARED/GROUPS_RECEIVED',
    payload: groups
  };
}

function removeGroupArticleFragment(id: string, articleFragmentId: string) {
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
) {
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
