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
  if (
    parentType !== 'articleFragment' &&
    parentType !== 'group' &&
    parentType !== 'clipboard'
  ) {
    return () => {}; // noop
  }

  const insertAction = addPersistMetaToAction(insertActionMap[parentType], {
    persistTo
  });

  const replaceAction = addPersistMetaToAction(replaceActionMap[parentType], {
    persistTo
  });

  const selector = selectorMap[parentType];

  return insertAndDedupeSiblings(
    id,
    state => selector(state, parentId),
    [insertAction(parentId, id, index)],
    children => replaceAction(parentId, children)
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
  if (
    (fromParentType !== 'articleFragment' &&
      fromParentType !== 'group' &&
      fromParentType !== 'clipboard') ||
    (toParentType !== 'articleFragment' &&
      toParentType !== 'group' &&
      fromParentType !== 'clipboard')
  ) {
    return () => {};
  }

  const selector = selectorMap[toParentType];
  const removeAction = addPersistMetaToAction(removeActionMap[fromParentType], {
    persistTo
  });
  const insertAction = addPersistMetaToAction(insertActionMap[toParentType], {
    persistTo
  });
  const replaceAction = addPersistMetaToAction(replaceActionMap[toParentType], {
    persistTo
  });

  return insertAndDedupeSiblings(
    id,
    state => selector(state, toParentId),
    [removeAction(fromParentId, id), insertAction(toParentId, id, index)],
    children => replaceAction(toParentId, children)
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
