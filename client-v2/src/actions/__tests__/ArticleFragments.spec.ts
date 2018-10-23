import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { enableBatching } from 'redux-batched-actions';
import { insertClipboardArticleFragment } from '../ArticleFragments';
import clipboardReducer from '../../reducers/clipboardReducer';
import articleFragmentsReducer from '../../shared/reducers/articleFragmentsReducer';

const root = (state: any, action: any) => ({
  clipboard: clipboardReducer(state.clipboard, action),
  shared: {
    articleFragments: articleFragmentsReducer(
      state.shared.articleFragments,
      action
    )
  }
});

const run = (exists: any, added: any) =>
  createStore(
    enableBatching(root),
    {
      clipboard: exists.map(([uuid]: [string]) => uuid),
      shared: {
        articleFragments: [...exists, added].reduce(
          (acc, [uuid, id]) => ({ ...acc, [uuid]: { uuid, id } }),
          {}
        )
      }
    },
    applyMiddleware(thunk)
  );

const testAdd = (exists: Array<[string, string]>) => (
  [uuid, id]: [string, string],
  index: number,
  afId: string | void = undefined
) => {
  const { dispatch, getState } = run(exists, [uuid, id]);
  expect(
    dispatch(insertClipboardArticleFragment(
      afId ? 'articleFragment' : 'clipboard',
      afId || '',
      { uuid, id: uuid, meta: {}, frontPublicationDate: Date.now() },
      index
    ) as any)
  );
  return getState();
};

const existing: Array<[string, string]> = [['a', '1'], ['b', '2'], ['c', '3']];
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
