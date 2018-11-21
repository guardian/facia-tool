import {
  insertArticleFragment,
  removeSupportingArticleFragment,
  removeGroupArticleFragment,
  updateArticleFragmentMeta
} from 'shared/actions/ArticleFragments';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { RemoveClipboardArticleFragment } from 'types/Action';

function removeClipboardArticleFragment(
  articleFragmentId: string
): RemoveClipboardArticleFragment {
  return {
    type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId
    }
  };
}

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

const removeSupportingArticleFragmentWithPersist = addPersistMetaToAction(
  removeSupportingArticleFragment,
  {
    persistTo: 'collection'
  }
);

const removeGroupArticleFragmentWithPersist = addPersistMetaToAction(
  removeGroupArticleFragment,
  {
    persistTo: 'collection',
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  }
);

const removeClipboardArticleFragmentWithPersist = addPersistMetaToAction(
  removeClipboardArticleFragment,
  {
    persistTo: 'clipboard',
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  }
);

const removeClipboardSupportingArticleFragmentWithPersist = addPersistMetaToAction(
  removeSupportingArticleFragment,
  {
    persistTo: 'clipboard',
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  }
);

// const { parent, supporting } = copy
//   ? cloneFragment(fragment, articleFragmentsFromRootStateSelector(getState()))
//   : { parent: fragment, supporting: [] };

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
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  removeGroupArticleFragmentWithPersist as removeGroupArticleFragment,
  removeClipboardArticleFragmentWithPersist as removeArticleFragmentFromClipboard,
  removeClipboardSupportingArticleFragmentWithPersist as removeSupportingArticleFragmentFromClipboard
};
