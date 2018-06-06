// @flow

import type { ArticleFragment } from 'shared/types/Collection';
import type { Action } from '../types/Action';

function articleFragmentsReceived(articleFragments: {
  [string]: ArticleFragment
}): Action {
  return {
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload: articleFragments
  };
}

function removeSupportingArticleFragment(
  id: string,
  supportingArticleFragmentId: string
): Action {
  return {
    type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT',
    payload: {
      id,
      supportingArticleFragmentId
    }
  };
}

function addSupportingArticleFragment(
  id: string,
  supportingArticleFragmentId: string,
  index: number
): Action {
  return {
    type: 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT',
    payload: {
      id,
      supportingArticleFragmentId,
      index
    }
  };
}

function changeArticleGroup(id: string, newGroup: string): Action {
  return {
    type: 'SHARED/CHANGE_ARTICLE_GROUP',
    payload: {
      id,
      group: newGroup
    }
  };
}

export {
  articleFragmentsReceived,
  removeSupportingArticleFragment,
  addSupportingArticleFragment,
  changeArticleGroup
};
