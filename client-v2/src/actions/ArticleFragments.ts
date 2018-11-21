import {
  insertArticleFragment,
  removeArticleFragment,
  updateArticleFragmentMeta
} from 'shared/actions/ArticleFragments';
import { addPersistMetaToAction } from 'util/storeMiddleware';

const updateArticleFragmentMetaWithPersist = addPersistMetaToAction(
  updateArticleFragmentMeta,
  {
    persistTo: 'collection'
  }
);

const updateClipboardArticleFragmentMetaWithPersist = addPersistMetaToAction(
  updateArticleFragmentMeta,
  {
    persistTo: 'clipboard'
  }
);

const removeArticleFragmentWithPersist = (
  persistTo: 'collection' | 'clipboard'
) =>
  addPersistMetaToAction(removeArticleFragment, {
    persistTo,
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  });

const insertArticleFragmentWithPersist = (
  persistTo: 'collection' | 'clipboard'
) =>
  addPersistMetaToAction(insertArticleFragment, {
    persistTo,
    key: 'articleFragmentId'
  });

const insertClipboardArticleFragmentWithPersist = addPersistMetaToAction(
  insertArticleFragment,
  {
    persistTo: 'clipboard',
    key: 'articleFragmentId'
  }
);

export {
  insertArticleFragmentWithPersist as insertArticleFragment,
  insertClipboardArticleFragmentWithPersist as insertClipboardArticleFragment,
  updateArticleFragmentMetaWithPersist as updateArticleFragmentMeta,
  updateClipboardArticleFragmentMetaWithPersist as updateClipboardArticleFragmentMeta,
  removeArticleFragmentWithPersist as removeArticleFragment
};
