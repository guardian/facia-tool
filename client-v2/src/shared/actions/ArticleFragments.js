// @flow

import v4 from 'uuid/v4';
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

function addArticleFragment(id: string) {
  return (dispatch: Dispatch) => {
    // TODO check if external article is already stored in the state
    const fragment = {
      uuid: v4(),
      id,
      frontPublicationDate: Date.now(),
      meta: {}
    };

    dispatch(
      articleFragmentsReceived({
        [fragment.uuid]: fragment
      })
    );
    return fragment.uuid;
  };
}

export {
  articleFragmentsReceived,
  removeSupportingArticleFragment,
  addSupportingArticleFragment,
  addArticleFragment
};
