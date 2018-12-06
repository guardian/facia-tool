import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import clipboardReducer from '../../reducers/clipboardReducer';
import groupsReducer from '../../shared/reducers/groupsReducer';
import articleFragmentsReducer from '../../shared/reducers/articleFragmentsReducer';
import {
  createGroupArticlesSelector,
  createSupportingArticlesSelector,
  articleFragmentSelector,
  selectSharedState
} from '../../shared/selectors/shared';
import { clipboardSelector as innerClipboardSelector } from '../../selectors/frontsSelectors';
import {
  createArticleFragmentStateFromSpec,
  ArticleFragmentSpec,
  specToFragment
} from './utils';
import {
  moveArticleFragment,
  insertArticleFragment
} from 'actions/ArticleFragments';
import {
  reducer as collectionsReducer,
  initialState as collectionsState
} from 'shared/bundles/collectionsBundle';

const root = (state: any = {}, action: any) => ({
  clipboard: clipboardReducer(state.clipboard, action, state.shared),
  shared: {
    articleFragments: articleFragmentsReducer(
      state.shared.articleFragments,
      action,
      state.shared
    ),
    collections: collectionsReducer(state.shared.collections, action),
    groups: groupsReducer(state.shared.groups, action, state.shared)
  }
});

const buildStore = (added: ArticleFragmentSpec) => {
  const groupA: ArticleFragmentSpec[] = [
    ['a', '1', [['g', '7']]],
    ['b', '2', undefined],
    ['c', '3', undefined]
  ];
  const groupB: ArticleFragmentSpec[] = [
    ['i', '9', [['g', '7']]],
    ['j', '10', undefined],
    ['k', '11', undefined]
  ];
  const clipboard: ArticleFragmentSpec[] = [
    ['d', '4', undefined],
    ['e', '5', undefined],
    ['f', '6', undefined]
  ];
  const all = [...groupA, ...groupB, ...clipboard, added];
  const state = {
    shared: {
      collections: {
        ...collectionsState,
        data: {
          a: {
            id: 'a',
            live: ['a', 'b']
          }
        }
      },
      articleFragments: createArticleFragmentStateFromSpec(all),
      groups: {
        a: { articleFragments: groupA.map(([uuid]) => uuid), uuid: 'a' },
        b: { articleFragments: groupB.map(([uuid]) => uuid), uuid: 'b' }
      }
    },
    clipboard: clipboard.map(([uuid]) => uuid)
  };
  return createStore(root, state as any, applyMiddleware(thunk));
};

const insert = async (
  [uuid, id]: [string, string],
  index: number,
  parentType: string,
  parentId: string
) => {
  const { dispatch, getState } = buildStore([uuid, id, undefined]);
  await dispatch(insertArticleFragment(
    { type: parentType, id: parentId, index },
    parentId,
    'collection',
    afId => () =>
      Promise.resolve(
        articleFragmentSelector(selectSharedState(getState()), uuid)
      )
  ) as any);
  return getState();
};

const move = (
  [uuid, id]: [string, string],
  index: number,
  toType: string,
  toId: string,
  fromType: string,
  fromId: string
) => {
  const { dispatch, getState } = buildStore([uuid, id, undefined]);
  dispatch(moveArticleFragment(
    {
      type: toType,
      id: toId,
      index
    },
    specToFragment([uuid, id, undefined]),
    {
      id: fromId,
      type: fromType,
      index: -1 // this doesn't matter
    },
    'clipboard' // doesn't matter where we persist
  ) as any);
  return getState();
};

const clipboardSelector = (state: any) => innerClipboardSelector(state);

const groupArticlesSelectorInner = createGroupArticlesSelector();
const groupArticlesSelector = (state: any, groupId: string) =>
  groupArticlesSelectorInner(state, { groupId }).map(({ uuid }) => uuid);

const supportingArticlesSelectorInner = createSupportingArticlesSelector();
const supportingArticlesSelector = (state: any, articleFragmentId: string) =>
  supportingArticlesSelectorInner(state, { articleFragmentId }).map(
    ({ uuid }) => uuid
  );

describe('ArticleFragments actions', () => {
  describe('insert', () => {
    it('adds article fragments that exist in the state', async () => {
      expect(
        clipboardSelector(await insert(['h', '8'], 2, 'clipboard', 'clipboard'))
      ).toEqual(['d', 'e', 'h', 'f']);

      expect(
        groupArticlesSelector(await insert(['h', '8'], 2, 'group', 'a'), 'a')
      ).toEqual(['a', 'b', 'h', 'c']);

      expect(
        supportingArticlesSelector(
          await insert(['h', '8'], 2, 'articleFragment', 'a'),
          'a'
        )
      ).toEqual(['g', 'h']);
    });

    it('moves existing articles when duplicates are added', async () => {
      expect(
        clipboardSelector(await insert(['h', '6'], 0, 'clipboard', 'clipboard'))
      ).toEqual(['h', 'd', 'e']);

      expect(
        groupArticlesSelector(await insert(['h', '3'], 0, 'group', 'a'), 'a')
      ).toEqual(['h', 'a', 'b']);

      expect(
        supportingArticlesSelector(
          await insert(['h', '7'], 0, 'articleFragment', 'a'),
          'a'
        )
      ).toEqual(['h']);
    });

    it('dedupe across groups in the same collection', async () => {
      const state = await insert(['h', '3'], 0, 'group', 'b');
      expect(groupArticlesSelector(state, 'a')).toEqual(['a', 'b']);
      expect(groupArticlesSelector(state, 'b')).toEqual(['h', 'i', 'j', 'k']);
    });

    it('adds to the end when the index is too high', async () => {
      expect(
        clipboardSelector(await insert(['h', '8'], 100, 'clipboard', 'clipboard'))
      ).toEqual(['d', 'e', 'f', 'h']);

      expect(
        groupArticlesSelector(await insert(['h', '8'], 100, 'group', 'a'), 'a')
      ).toEqual(['a', 'b', 'c', 'h']);

      expect(
        supportingArticlesSelector(
          await insert(['h', '8'], 100, 'articleFragment', 'a'),
          'a'
        )
      ).toEqual(['g', 'h']);
    });
  });

  describe('move', () => {
    it('removes articles from their previous position', () => {
      const s1 = move(['d', '4'], 0, 'group', 'a', 'clipboard', 'clipboard');
      expect(groupArticlesSelector(s1, 'a')).toEqual(['d', 'a', 'b', 'c']);
      expect(clipboardSelector(s1)).toEqual(['e', 'f']);

      const s2 = move(['a', '1'], 0, 'clipboard', 'clipboard', 'group', 'a');
      expect(groupArticlesSelector(s2, 'a')).toEqual(['b', 'c']);
      expect(clipboardSelector(s2)).toEqual(['a', 'd', 'e', 'f']);
    });
  });
});
