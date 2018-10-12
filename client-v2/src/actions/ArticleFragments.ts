import {
  addSupportingArticleFragment,
  removeSupportingArticleFragment,
  replaceArticleFragmentSupporting,
  addGroupArticleFragment,
  removeGroupArticleFragment,
  replaceGroupArticleFragments,
  insertAndDedupeSiblings,
  updateArticleFragmentMeta
} from 'shared/actions/ArticleFragments';
import {
  supportingArticlesSelector,
  groupArticlesSelector,
  clipboardArticlesSelector
} from 'shared/selectors/shared';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { updateClipboardContent } from 'actions/Clipboard';
import { State } from 'types/State';

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
  removeGroupArticleFragment,
  {
    persistTo: 'clipboard',
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  }
);

const selectorMap = {
  articleFragment: (state: State, id: string) =>
    supportingArticlesSelector(state, {
      articleFragmentId: id
    }),
  group: (state: State, id: string) =>
    groupArticlesSelector(state, {
      groupName: id
    }),
  clipboard: clipboardArticlesSelector
};

const insertActionMap = {
  articleFragment: addSupportingArticleFragment,
  group: addGroupArticleFragment,
  clipboard: (_: unknown, id: string, index: number) => addClipboardArticleFragment(id, index)
};

const removeActionMap = {
  articleFragment: removeSupportingArticleFragment,
  group: removeGroupArticleFragment,
  clipboard: (_: unknown, id: string) => removeClipboardArticleFragment(id)
};

const replaceActionMap = {
  articleFragment: replaceArticleFragmentSupporting,
  group: replaceGroupArticleFragments,
  clipboard: (_: unknown, children: string[]) => updateClipboardContent(children)
};

const createInsertArticleFragment = (persistTo: 'collection' | 'clipboard') => (
  parentType: string,
  parentId: string,
  id: string,
  index: number
) => {
  const insert = insertActionMap[parentType];
  const replaceAction = replaceActionMap[parentType];
  const selector = selectorMap[parentType];
  if (!insert || !replaceAction || !selector) {
    return () => {}; // noop
  }

  const replace = addPersistMetaToAction(replaceAction, {
    persistTo,
    id
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
  const remove = removeActionMap[fromParentType];
  const insert = insertActionMap[toParentType];
  const replaceAction = replaceActionMap[toParentType];
  if (!selector || !insert || !remove || !replaceAction) {
    return () => {};
  }
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
  updateArticleFragmentMetaWithPersist as updateArticleFragmentMeta,
  updateClipboardArticleFragmentMetaWithPersist as updateClipboardArticleFragmentMeta,
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  removeGroupArticleFragmentWithPersist as removeGroupArticleFragment,
  removeClipboardArticleFragmentWithPersist as removeSupportingArticleFragmentFromClipboard
};
