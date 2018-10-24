import {
  addSupportingArticleFragment,
  removeSupportingArticleFragment,
  replaceArticleFragmentSupporting,
  addGroupArticleFragment,
  removeGroupArticleFragment,
  replaceGroupArticleFragments,
  insertAndDedupeSiblings,
  updateArticleFragmentMeta,
  articleFragmentsReceived
} from 'shared/actions/ArticleFragments';
import {
  createSupportingArticlesSelector,
  createGroupArticlesSelector,
  articleFragmentsFromRootStateSelector
} from 'shared/selectors/shared';
import { clipboardArticlesSelector } from 'selectors/clipboardSelectors';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { updateClipboardContent } from 'actions/Clipboard';
import { State } from 'types/State';
import {
  AddClipboardArticleFragment,
  RemoveClipboardArticleFragment,
  Action
} from 'types/Action';
import { ArticleFragment } from 'shared/types/Collection';
import { Dispatch, GetState } from 'types/Store';
import { cloneFragment } from 'shared/util/articleFragment';
import keyBy from 'lodash/keyBy';

function addClipboardArticleFragment(
  articleFragmentId: string,
  index: number
): AddClipboardArticleFragment {
  return {
    type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT',
    payload: {
      articleFragmentId,
      index
    }
  };
}

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

const supportingArticlesSelector = createSupportingArticlesSelector();
const groupArticlesSelector = createGroupArticlesSelector();

const selectorMap: {
  [key: string]: (state: State, id: string) => ArticleFragment[];
} = {
  articleFragment: (state: State, id: string) =>
    supportingArticlesSelector(state, {
      articleFragmentId: id
    }),
  group: (state: State, id: string) =>
    groupArticlesSelector(state, {
      groupId: id
    }),
  clipboard: clipboardArticlesSelector
};

interface ActionMap<T> {
  [key: string]: T;
}

type InsertAction = (parentId: string, id: string, index: number) => Action;
const insertActionMap: ActionMap<InsertAction> = {
  articleFragment: addSupportingArticleFragment,
  group: addGroupArticleFragment,
  clipboard: (_: string, id: string, index: number) =>
    addClipboardArticleFragment(id, index)
};

type RemoveAction = (parentId: string, id: string) => Action;
const removeActionMap: ActionMap<RemoveAction> = {
  articleFragment: removeSupportingArticleFragment,
  group: removeGroupArticleFragment,
  clipboard: (_: string, id: string) => removeClipboardArticleFragment(id)
};

type ReplaceAction = (parentId: string, children: string[]) => Action;
const replaceActionMap: ActionMap<ReplaceAction> = {
  articleFragment: replaceArticleFragmentSupporting,
  group: replaceGroupArticleFragments,
  clipboard: (_: string, children?: string[]) =>
    updateClipboardContent(children)
};

const createInsertArticleFragment = (
  persistTo: 'collection' | 'clipboard',
  copy: boolean = false
) => (
  parentType: string,
  parentId: string,
  fragment: ArticleFragment,
  index: number
) => (dispatch: Dispatch, getState: GetState) => {
  const { parent, supporting } = copy
    ? cloneFragment(fragment, articleFragmentsFromRootStateSelector(getState()))
    : { parent: fragment, supporting: [] };

  const insert = insertActionMap[parentType];
  const replaceAction = replaceActionMap[parentType];
  const selector = selectorMap[parentType];

  if (!insert || !replaceAction || !selector) {
    return () => undefined; // noop
  }

  const replace = addPersistMetaToAction(replaceAction, {
    persistTo,
    id: parent.uuid
  });

  return insertAndDedupeSiblings(
    parent.uuid,
    state => selector(state, parentId),
    [
      articleFragmentsReceived(
        keyBy([parent, ...supporting], ({ uuid }) => uuid)
      ),
      insert(parentId, parent.uuid, index)
    ],
    children => replace(parentId, children)
  )(dispatch, getState, undefined);
  // TS Issue ----------^
  // https://github.com/Microsoft/TypeScript/issues/12400
};

const insertArticleFragment = createInsertArticleFragment('collection');
const copyArticleFragment = createInsertArticleFragment('collection', true);

const insertClipboardArticleFragment = createInsertArticleFragment('clipboard');
const copyClipboardArticleFragment = createInsertArticleFragment(
  'clipboard',
  true
);

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
    return () => undefined;
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
  copyArticleFragment,
  copyClipboardArticleFragment,
  updateArticleFragmentMetaWithPersist as updateArticleFragmentMeta,
  updateClipboardArticleFragmentMetaWithPersist as updateClipboardArticleFragmentMeta,
  removeSupportingArticleFragmentWithPersist as removeSupportingArticleFragment,
  removeGroupArticleFragmentWithPersist as removeGroupArticleFragment,
  removeClipboardArticleFragmentWithPersist as removeArticleFragmentFromClipboard,
  removeClipboardSupportingArticleFragmentWithPersist as removeSupportingArticleFragmentFromClipboard
};
