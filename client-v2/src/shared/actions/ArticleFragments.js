// @flow

import v4 from 'uuid/v4';
import type { ArticleFragment } from 'shared/types/Collection';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getArticles } from 'services/faciaApi';

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

const createFragment = (id: string, supporting = []) => ({
  uuid: v4(),
  id,
  frontPublicationDate: Date.now(),
  meta: {
    supporting
  }
});

function addArticleFragment(id: string, supporting: string[] = []) {
  return (dispatch: Dispatch) =>
    getArticles([id, ...supporting])
      .catch(error => dispatch(externalArticleActions.fetchError(error, [id])))
      .then(articles => {
        dispatch(externalArticleActions.fetchSuccess(articles));
        const supportingArray = supporting.map(createFragment);
        const supportingFragments = supportingArray.reduce(
          (acc, frag) => ({
            ...acc,
            [frag.uuid]: frag
          }),
          {}
        );
        const parentFragment = createFragment(
          id,
          supportingArray.map(({ uuid }) => uuid)
        );

        dispatch(
          articleFragmentsReceived({
            [parentFragment.uuid]: parentFragment,
            ...supportingFragments
          })
        );
        return parentFragment.uuid;
      });
}

export {
  articleFragmentsReceived,
  removeSupportingArticleFragment,
  addSupportingArticleFragment,
  addArticleFragment
};
