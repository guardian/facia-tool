// @flow

import {
  removeSupportingArticleFragment,
  addSupportingArticleFragment,
  changeArticleGroup
} from 'shared/actions/ArticleFragments';

/**
 * We add the persistence middleware meta to actions we'd like to trigger persist
 * operations here - see the persistCollectionOnEdit middleware.
 */
function removeSupportingArticleFragmentWithPersist(...args: *) {
  return {
    ...removeSupportingArticleFragment(...args),
    meta: {
      persistTo: 'collection'
    }
  };
}

function addSupportingArticleFragmentWithPersist(...args: *) {
  return {
    ...addSupportingArticleFragment(...args),
    meta: {
      persistTo: 'collection'
    }
  };
}

function changeArticleGroupWithPersist(...args: *) {
  return {
    ...changeArticleGroup(...args),
    meta: {
      persistTo: 'collection'
    }
  };
}

export {
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  addSupportingArticleFragmentWithPersist as addSupportingArticleFragment,
  changeArticleGroupWithPersist as changeArticleGroup
};
