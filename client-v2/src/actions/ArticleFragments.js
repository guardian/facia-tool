// @flow

import {
  removeSupportingArticleFragment,
  addSupportingArticleFragment
} from 'shared/actions/ArticleFragments';
import { addPersistMetaToAction } from 'util/storeMiddleware';

const removeSupportingArticleFragmentWithPersist = addPersistMetaToAction(
  removeSupportingArticleFragment,
  {
    persistTo: 'collection'
  }
);

const addSupportingArticleFragmentWithPersist = addPersistMetaToAction(
  addSupportingArticleFragment,
  {
    persistTo: 'collection'
  }
);

export {
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  addSupportingArticleFragmentWithPersist as addSupportingArticleFragment
};
