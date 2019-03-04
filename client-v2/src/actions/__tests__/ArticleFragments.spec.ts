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
  insertArticleFragment,
  addImageToArticleFragment
} from 'actions/ArticleFragments';
import {
  reducer as collectionsReducer,
  initialState as collectionsState
} from 'shared/bundles/collectionsBundle';
import confirmModal from 'reducers/confirmModalReducer';
import { endConfirmModal } from 'actions/ConfirmModal';
import config from 'reducers/configReducer';

const root = (state: any = {}, action: any) => ({
  confirmModal: confirmModal(state.confirmModal, action),
  clipboard: clipboardReducer(state.clipboard, action, state.shared),
  shared: {
    articleFragments: articleFragmentsReducer(
      state.shared.articleFragments,
      action,
      state.shared
    ),
    collections: collectionsReducer(state.shared.collections, action),
    groups: groupsReducer(state.shared.groups, action, state.shared)
  },
  config: config(state.config, action)
});

const buildStore = (added: ArticleFragmentSpec, collectionCap = Infinity) => {
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
    confirmModal: null,
    config: {
      collectionCap
    },
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
  insertedArticleFragmentSpec: [string, string],
  index: number,
  parentType: string,
  parentId: string,
  // sets the collection cap and allows a way to accept, reject, ignore the
  // modal immediately
  collectionCapInfo?: {
    cap: number;
    accept: boolean | null;
  }
) => {
  const [uuid, id] = insertedArticleFragmentSpec;
  const { dispatch, getState } = buildStore(
    [uuid, id, undefined],
    collectionCapInfo ? collectionCapInfo.cap : Infinity
  );
  await dispatch(insertArticleFragment(
    { type: parentType, id: parentId, index },
    parentId,
    'collection',
    afId => () =>
      Promise.resolve(
        articleFragmentSelector(selectSharedState(getState()), uuid)
      )
  ) as any);

  if (collectionCapInfo && collectionCapInfo.accept !== null) {
    dispatch(endConfirmModal(collectionCapInfo.accept));
  }

  return getState();
};

const move = (
  movedArticleFragmentSpec: [string, string],
  index: number,
  toType: string,
  toId: string,
  fromType: string,
  fromId: string,
  // sets the collection cap and allows a way to accept, reject, ignore the
  // modal immediately
  collectionCapInfo?: {
    cap: number;
    accept: boolean | null;
  }
) => {
  const [uuid, id] = movedArticleFragmentSpec;
  const { dispatch, getState } = buildStore(
    [uuid, id, undefined],
    collectionCapInfo ? collectionCapInfo.cap : Infinity
  );
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

  // setting accept to null will enuse the modal is still "open" during the test
  // assertions
  if (collectionCapInfo && collectionCapInfo.accept !== null) {
    dispatch(endConfirmModal(collectionCapInfo.accept));
  }

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
        clipboardSelector(
          await insert(['h', '8'], 100, 'clipboard', 'clipboard')
        )
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

  it('enforces collection caps on insert through a modal', async () => {
    expect(
      groupArticlesSelector(
        await insert(['h', '8'], 2, 'group', 'a', {
          cap: 3,
          accept: true
        }),
        'a'
      )
    ).toEqual(['a', 'b', 'h']);

    expect(
      groupArticlesSelector(
        await insert(['h', '8'], 2, 'group', 'a', {
          cap: 3,
          accept: false
        }),
        'a'
      )
    ).toEqual(['a', 'b', 'c']);
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

    it('enforces collection caps on move through a modal', () => {
      const s1 = move(['d', '4'], 0, 'group', 'a', 'clipboard', 'clipboard', {
        cap: 3,
        accept: true
      });
      expect(groupArticlesSelector(s1, 'a')).toEqual(['d', 'a', 'b']);
      expect(clipboardSelector(s1)).toEqual(['e', 'f']);

      const s2 = move(['d', '4'], 0, 'group', 'a', 'clipboard', 'clipboard', {
        cap: 3,
        accept: false
      });
      expect(groupArticlesSelector(s2, 'a')).toEqual(['a', 'b', 'c']);
      expect(clipboardSelector(s2)).toEqual(['d', 'e', 'f']);
    });

    it('collection caps allow moves within collections without a modal', () => {
      const s1 = move(['a', '1'], 2, 'group', 'a', 'group', 'a', {
        cap: 3,
        accept: null
      });
      expect(groupArticlesSelector(s1, 'a')).toEqual(['b', 'a', 'c']);
    });
  });

  describe('insert image', () => {
    fit('adds the correct image data', () => {
      const s1 = root(
        { shared: { articleFragments: { a: {} } } },
        { type: '@@INIT' }
      );

      const src = 'http://www.images.com/image/1/master';
      const thumb = 'http://www.images.com/image/1/thumb';
      const origin = 'http://www.images.com/image/1';
      const height = 3000;
      const width = 3000;

      const s2 = root(
        s1,
        addImageToArticleFragment('a', {
          src,
          thumb,
          origin,
          height,
          width
        })
      );

      expect(s2.shared.articleFragments.a.meta).toMatchObject({
        imageReplace: true,
        imageSrc: src,
        imageSrcThumb: thumb,
        imageSrcOrigin: origin,
        imageSrcWidth: width.toString(),
        imageSrcHeight: height.toString()
      });
    });
  });
});
