// @flow

import type { ArticleFragment } from 'shared/types/Collection';

function articleFragmentsReceived(articleFragments: {
  [string]: ArticleFragment
}) {
  return {
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload: articleFragments
  };
}

function removeSupportingArticleFragment(
  id: string,
  supportingArticleFragmentId: string
) {
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
) {
  return {
    type: 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT',
    payload: {
      id,
      supportingArticleFragmentId,
      index
    }
  };
}

function changeArticleGroup(id: string, newGroup: string) {
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
