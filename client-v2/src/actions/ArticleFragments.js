// @flow

import {
  addSupportingArticleFragment,
  removeSupportingArticleFragment,
  replaceArticleFragmentSupporting,
  addGroupArticleFragment,
  removeGroupArticleFragment,
  replaceGroupArticleFragments,
  insertAndDedupeSiblings
} from 'shared/actions/ArticleFragments';
import {
  supportingArticlesSelector,
  groupArticlesSelector,
  clipboardArticlesSelector
} from 'shared/selectors/shared';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { updateClipboardContent } from 'actions/Clipboard';

function addClipboardArticleFragment(articleFragmentId: string, index: number) {
  return {
    type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId,
      index
    }
  };
}

function removeClipboardArticleFragment(articleFragmentId: string) {
  return {
    type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId
    }
  };
}

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
  removeGroupArticleFragment,
  {
    persistTo: 'clipboard',
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  }
);

const selectorMap = {
  articleFragment: (state, id) =>
    supportingArticlesSelector(state, {
      articleFragmentId: id
    }),
  group: (state, id) =>
    groupArticlesSelector(state, {
      groupName: id
    }),
  clipboard: clipboardArticlesSelector
};

const insertActionMap = {
  articleFragment: addSupportingArticleFragment,
  group: addGroupArticleFragment,
  clipboard: (_, id, index) => addClipboardArticleFragment(id, index)
};

const removeActionMap = {
  articleFragment: removeSupportingArticleFragment,
  group: removeGroupArticleFragment,
  clipboard: (_, id) => removeClipboardArticleFragment(id)
};

const replaceActionMap = {
  articleFragment: replaceArticleFragmentSupporting,
  group: replaceGroupArticleFragments,
  clipboard: (_, children) => updateClipboardContent(children)
};

const createInsertArticleFragment = (persistTo: 'collection' | 'clipboard') => (
  parentType: string,
  parentId: string,
  id: string,
  index: number
) => {
  const insertAction = insertActionMap[parentType];
  const replaceAction = replaceActionMap[parentType];
  const selector = selectorMap[parentType];
  if (!insertAction || !replaceAction || !selector) {
    return () => {}; // noop
  }

  const insert = addPersistMetaToAction(insertAction, {
    persistTo
  });

  const replace = addPersistMetaToAction(replaceAction, {
    persistTo
  });

  return insertAndDedupeSiblings(
    id,
    state => selector(state, parentId),
    [insert(parentId, id, index)],
    children => replace(parentId, children)
  );
};

const insertArticleFragment = createInsertArticleFragment('collection');
const insertClipboardArticleFragment = createInsertArticleFragment('clipboard');

/* separate clipboard */

const createMoveArticleFragment = (persistTo: 'collection' | 'clipboard') => (
  fromParentType: string,
  fromParentId: string,
  id: string,
  toParentType: string,
  toParentId: string,
  index: number
) => {
  const selector = selectorMap[toParentType];
  const removeAction = removeActionMap[fromParentType];
  const insertAction = insertActionMap[toParentType];
  const replaceAction = replaceActionMap[toParentType];
  if (!selector || !removeAction || !insertAction || !replaceAction) {
    return () => {};
  }
  const remove = addPersistMetaToAction(removeAction, {
    persistTo
  });
  const insert = addPersistMetaToAction(insertAction, {
    persistTo
  });
  const replace = addPersistMetaToAction(replaceAction, {
    persistTo
  });

  return insertAndDedupeSiblings(
    id,
    state => selector(state, toParentId),
    [remove(fromParentId, id), insert(toParentId, id, index)],
    children => replace(toParentId, children)
  );
};

const moveArticleFragment = createMoveArticleFragment('collection');
const moveClipboardArticleFragment = createMoveArticleFragment('clipboard');

export {
  insertArticleFragment,
  insertClipboardArticleFragment,
  moveArticleFragment,
  moveClipboardArticleFragment,
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  removeGroupArticleFragmentWithPersist as removeGroupArticleFragment,
  removeClipboardArticleFragmentWithPersist as removeSupportingArticleFragmentFromClipboard
};
