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

const removeSupportingArticleFragmentWithPersistToClipboard = addPersistMetaToAction(
  removeSupportingArticleFragment,
  {
    persistTo: 'clipboard'
  }
);

const addSupportingArticleFragmentWithPersistToClipboard = addPersistMetaToAction(
  addSupportingArticleFragment,
  {
    persistTo: 'clipboard'
  }
);

export {
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  addSupportingArticleFragmentWithPersist as addSupportingArticleFragment,
  addSupportingArticleFragmentWithPersistToClipboard as addSupportingArticleFragmentToClipboard,
  removeSupportingArticleFragmentWithPersistToClipboard as removeSupportingArticleFragmentFromClipboard
};
