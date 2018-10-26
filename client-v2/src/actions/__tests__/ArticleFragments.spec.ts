jest.mock('uuid/v4', () => jest.fn(() => 'uuid'));

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { enableBatching } from 'redux-batched-actions';
import {
  insertClipboardArticleFragment,
  copyClipboardArticleFragment,
  insertArticleFragment,
  copyArticleFragment
} from '../ArticleFragments';
import clipboardReducer from '../../reducers/clipboardReducer';
import groupsReducer from '../../shared/reducers/groupsReducer';
import articleFragmentsReducer from '../../shared/reducers/articleFragmentsReducer';
import { InsertActionCreator } from 'util/collectionUtils';

const root = (state: any, action: any) => ({
  clipboard: clipboardReducer(state.clipboard, action),
  shared: {
    articleFragments: articleFragmentsReducer(
      state.shared.articleFragments,
      action
    ),
    groups: groupsReducer(state.shared.groups, action)
  }
});

type ArticleFragmentSpec = [string, string];

interface ArticleFragmentMap {
  [key: string]: {
    uuid: string;
    id: string;
  };
}

interface InitialState {
  shared: {
    articleFragments: ArticleFragmentMap;
  };
}

type StateBuilder = (
  state: InitialState,
  existing: ArticleFragmentSpec[]
) => object;

const buildStore = (
  appendToInitialState: StateBuilder,
  existing: ArticleFragmentSpec[],
  added: ArticleFragmentSpec
) =>
  createStore(
    enableBatching(root),
    appendToInitialState(
      {
        shared: {
          articleFragments: [...existing, added].reduce(
            (acc, [uuid, id]) => ({ ...acc, [uuid]: { uuid, id } }),
            {} as ArticleFragmentMap
          )
        }
      },
      existing
    ),
    applyMiddleware(thunk)
  );

const testAddActions = (existing: ArticleFragmentSpec[]) => (
  appendToInitialState: StateBuilder
) => (actionCreator: InsertActionCreator) => (
  [uuid, id]: ArticleFragmentSpec,
  index: number,
  parentType: string,
  parentId: string
) => {
  const { dispatch, getState } = buildStore(appendToInitialState, existing, [
    uuid,
    id
  ]);
  dispatch(actionCreator(
    parentType,
    parentId,
    { uuid, id, meta: {}, frontPublicationDate: Date.now() },
    index
  ) as any);
  return getState();
};

const createAdder = testAddActions([['a', '1'], ['b', '2'], ['c', '3']]);
const clipboardAdder = createAdder((state, existing) => ({
  ...state,
  clipboard: existing.map(([uuid]) => uuid)
}));
const clipboardInserter = clipboardAdder(insertClipboardArticleFragment);
const clipboardCopier = clipboardAdder(copyClipboardArticleFragment);

const groupAdder = createAdder((state, existing) => ({
  ...state,
  shared: {
    ...state.shared,
    groups: {
      a: {
        articleFragments: existing.map(([uuid]) => uuid)
      }
    }
  }
}));
const groupInserter = groupAdder(insertArticleFragment);
const groupCopier = groupAdder(copyArticleFragment);

const testInsertingForClipboardAndGroup = (
  articleFragmentSpec: ArticleFragmentSpec,
  index: number,
  parentId?: string
) => (equal: string[]) => {
  expect(
    clipboardInserter(
      articleFragmentSpec,
      index,
      parentId ? 'articleFragment' : 'clipboard',
      parentId || 'clipboard'
    ).clipboard
  ).toEqual(equal);
  expect(
    groupInserter(
      articleFragmentSpec,
      index,
      parentId ? 'articleFragment' : 'group',
      parentId || 'a'
    ).shared.groups.a.articleFragments
  ).toEqual(equal);
};

const testCopyingForClipboardAndGroup = (
  articleFragmentSpec: ArticleFragmentSpec,
  index: number,
  parentId?: string
) => (equal: string[]) => {
  expect(
    clipboardCopier(
      articleFragmentSpec,
      index,
      parentId ? 'articleFragment' : 'clipboard',
      parentId || 'clipboard'
    ).clipboard
  ).toEqual(equal);
  expect(
    groupCopier(
      articleFragmentSpec,
      index,
      parentId ? 'articleFragment' : 'group',
      parentId || 'a'
    ).shared.groups.a.articleFragments
  ).toEqual(equal);
};

describe('ArticleFragments actions', () => {
  it('adds article fragments that exist in the state', () => {
    testInsertingForClipboardAndGroup(['d', '4'], 2)(['a', 'b', 'd', 'c']);
  });

  it('creates article fragments that exist in the state', () => {
    // mocking uuid/v4 to always return `uuid`
    testCopyingForClipboardAndGroup(['d', '4'], 2)(['a', 'b', 'uuid', 'c']);
  });

  it('moves existing articles when duplicates are added', () => {
    testInsertingForClipboardAndGroup(['d', '2'], 0)(['d', 'a', 'c']);
  });

  it('copies existing articles when duplicates are added', () => {
    testCopyingForClipboardAndGroup(['d', '2'], 0)(['uuid', 'a', 'c']);
  });

  it('does not dedupe when adding to supporting', () => {
    testInsertingForClipboardAndGroup(['d', '2'], 0, 'a')(['a', 'b', 'c']);
    testCopyingForClipboardAndGroup(['d', '2'], 0, 'a')(['a', 'b', 'c']);
  });

  it('adding at an index that is too high adds to the end', () => {
    testInsertingForClipboardAndGroup(['d', '4'], 9)(['a', 'b', 'c', 'd']);
    testCopyingForClipboardAndGroup(['d', '4'], 9)(['a', 'b', 'c', 'uuid']);
  });
});
