// @flow

import {
  removeSupportingArticleFragment,
  addSupportingArticleFragment,
  changeArticleGroup
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

const changeArticleGroupWithPersist = addPersistMetaToAction(
  changeArticleGroup,
  {
    persistTo: 'collection'
  }
);

export {
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  addSupportingArticleFragmentWithPersist as addSupportingArticleFragment,
  changeArticleGroupWithPersist as changeArticleGroup,
  addSupportingArticleFragmentWithPersistToClipboard as addSupportingArticleFragmentToClipboard,
  removeSupportingArticleFragmentWithPersistToClipboard as removeSupportingArticleFragmentFromClipboard
};
