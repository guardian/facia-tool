import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { insertArticleFragment } from '../../shared/actions/ArticleFragments';
import clipboardReducer from '../../reducers/clipboardReducer';
import groupsReducer from '../../shared/reducers/groupsReducer';
import articleFragmentsReducer from '../../shared/reducers/articleFragmentsReducer';
import {
  createGroupArticlesSelector,
  createSupportingArticlesSelector
} from '../../shared/selectors/shared';
import { clipboardSelector as innerClipboardSelector } from '../../selectors/frontsSelectors';
import {
  createArticleFragmentStateFromSpec,
  ArticleFragmentSpec
} from './utils';

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

const buildStore = (added: ArticleFragmentSpec) => {
  const group: ArticleFragmentSpec[] = [
    ['a', '1', [['g', '7']]],
    ['b', '2', null],
    ['c', '3', null]
  ];
  const clipboard: ArticleFragmentSpec[] = [
    ['d', '4', null],
    ['e', '5', null],
    ['f', '6', null]
  ];
  const all = [...group, ...clipboard, added];
  return createStore(
    root,
    {
      shared: {
        articleFragments: createArticleFragmentStateFromSpec(all),
        groups: {
          a: {
            articleFragments: group.map(([uuid]) => uuid)
          }
        }
      },
      clipboard: clipboard.map(([uuid]) => uuid)
    },
    applyMiddleware(thunk)
  );
};

const insert = (
  [uuid, id]: [string, string],
  index: number,
  parentType: string,
  parentId: string
) => {
  const { dispatch, getState } = buildStore([uuid, id, null]);
  const { articleFragments } = getState().shared;
  dispatch(insertArticleFragment(
    {
      type: parentType,
      id: parentId,
      index
    },
    uuid,
    articleFragments
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
    it('adds article fragments that exist in the state', () => {
      expect(
        clipboardSelector(insert(['h', '8'], 2, 'clipboard', 'clipboard'))
      ).toEqual(['d', 'e', 'h', 'f']);

      expect(
        groupArticlesSelector(insert(['h', '8'], 2, 'group', 'a'), 'a')
      ).toEqual(['a', 'b', 'h', 'c']);

      expect(
        supportingArticlesSelector(
          insert(['h', '8'], 2, 'articleFragment', 'a'),
          'a'
        )
      ).toEqual(['g', 'h']);
    });

    it('moves existing articles when duplicates are added', () => {
      expect(
        clipboardSelector(insert(['h', '6'], 0, 'clipboard', 'clipboard'))
      ).toEqual(['h', 'd', 'e']);

      expect(
        groupArticlesSelector(insert(['h', '3'], 0, 'group', 'a'), 'a')
      ).toEqual(['h', 'a', 'b']);

      expect(
        supportingArticlesSelector(
          insert(['h', '7'], 0, 'articleFragment', 'a'),
          'a'
        )
      ).toEqual(['h']);
    });

    it('adding at an index that is too high adds to the end', () => {
      expect(
        clipboardSelector(insert(['h', '8'], 100, 'clipboard', 'clipboard'))
      ).toEqual(['d', 'e', 'f', 'h']);

      expect(
        groupArticlesSelector(insert(['h', '8'], 100, 'group', 'a'), 'a')
      ).toEqual(['a', 'b', 'c', 'h']);

      expect(
        supportingArticlesSelector(
          insert(['h', '8'], 100, 'articleFragment', 'a'),
          'a'
        )
      ).toEqual(['g', 'h']);
    });
  });

  describe('move', () => {

  });
});
