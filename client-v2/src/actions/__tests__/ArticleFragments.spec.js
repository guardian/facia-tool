// @flow

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { enableBatching } from 'redux-batched-actions';
import { insertClipboardArticleFragment } from '../ArticleFragments';
import clipboardReducer from '../../reducers/clipboardReducer';
import articleFragmentsReducer from '../../shared/reducers/articleFragmentsReducer';

const root = (state, action) => ({
  clipboard: clipboardReducer(state.clipboard, action),
  shared: {
    articleFragments: articleFragmentsReducer(
      state.shared.articleFragments,
      action
    )
  }
});

const run = (existing, added) =>
  createStore(
    enableBatching(root),
    {
      clipboard: existing.map(([uuid]) => uuid),
      shared: {
        articleFragments: [...existing, added].reduce(
          (acc, [uuid, id]) => ({ ...acc, [uuid]: { uuid, id } }),
          {}
        )
      }
    },
    applyMiddleware(thunk)
  );

const testAdd = (existing: Array<[string, string]>) => (
  [uuid: string, id: string],
  index: number,
  afId: ?string = null
) => {
  const { dispatch, getState } = run(existing, [uuid, id]);
  expect(
    dispatch(
      insertClipboardArticleFragment(
        afId ? 'articleFragment' : 'clipboard',
        afId || '',
        uuid,
        index
      )
    )
  );
  return getState();
};

const existing = [['a', '1'], ['b', '2'], ['c', '3']];
const add = testAdd(existing);

describe('ArticleFragments actions', () => {
  it('adds article fragments that exist in the state', () => {
    expect(add(['d', '4'], 2).clipboard).toEqual(['a', 'b', 'd', 'c']);
  });

  it('moves existing articles when duplicates are added', () => {
    expect(add(['d', '2'], 0).clipboard).toEqual(['d', 'a', 'c']);
  });

  it('does not dedupe when adding to supporting', () => {
    expect(add(['d', '2'], 0, 'a').clipboard).toEqual(['a', 'b', 'c']);
  });

  it('adding at an index that is too high adds to the end', () => {
    expect(add(['d', '4'], 9).clipboard).toEqual(['a', 'b', 'c', 'd']);
  });
});
