import uniqBy from 'lodash/uniqBy';
import keyBy from 'lodash/keyBy';
import { ArticleFragment, ArticleFragmentMeta } from 'shared/types/Collection';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getArticles } from 'services/faciaApi';
import { State } from 'types/State';
import { Dispatch, ThunkResult, GetState } from 'types/Store';
import {
  ArticleFragmentsReceived,
  RemoveSupportingArticleFragment,
  AddSupportingArticleFragment,
  AddGroupArticleFragment,
  RemoveGroupArticleFragment,
  UpdateArticleFragmentMeta,
  ReplaceGroupArticleFragments,
  ReplaceArticleFragmentSupporting
} from 'shared/types/Action';
import { createFragment } from 'shared/util/articleFragment'
import { batchActions } from 'redux-batched-actions';

function updateArticleFragmentMeta(
  id: string,
  meta: ArticleFragmentMeta
): UpdateArticleFragmentMeta {
  return {
    type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META',
    payload: {
      id,
      meta
    }
  };
}

function articleFragmentsReceived(articleFragments: {
  [id: string]: ArticleFragment;
}): ArticleFragmentsReceived {
  return {
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload: articleFragments
  };
}

function removeSupportingArticleFragment(
  id: string,
  supportingArticleFragmentId: string
): RemoveSupportingArticleFragment {
  return {
    type: 'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT',
    payload: {
      id,
      supportingArticleFragmentId
    }
  };
}

const addSupportingArticleFragment = (
  id: string,
  supportingArticleFragmentId: string,
  index: number
): AddSupportingArticleFragment => ({
  type: 'SHARED/ADD_SUPPORTING_ARTICLE_FRAGMENT',
  payload: {
    id,
    supportingArticleFragmentId,
    index
  }
});

const addGroupArticleFragment = (
  id: string,
  articleFragmentId: string,
  index: number
): AddGroupArticleFragment => ({
  type: 'SHARED/ADD_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id,
    articleFragmentId,
    index
  }
});

const removeGroupArticleFragment = (
  id: string,
  articleFragmentId: string
): RemoveGroupArticleFragment => ({
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id,
    articleFragmentId
  }
});

const replaceArticleFragmentSupporting = (
  id: string,
  supporting: string[] = []
): ReplaceArticleFragmentSupporting => ({
  type: 'SHARED/REPLACE_ARTICLE_FRAGMENT_SUPPORTING',
  payload: {
    id,
    supporting
  }
});

const replaceGroupArticleFragments = (
  id: string,
  articleFragments: string[] = []
): ReplaceGroupArticleFragments => ({
  type: 'SHARED/REPLACE_GROUP_ARTICLE_FRAGMENTS',
  payload: {
    id,
    articleFragments
  }
});

function addArticleFragment(id: string) {
  return (dispatch: Dispatch) =>
    getArticles([id])
      .then(([article]) => {
        dispatch(externalArticleActions.fetchSuccess([article]));
        const fragment = createFragment(article.id);
        dispatch(
          articleFragmentsReceived({
            [fragment.uuid]: fragment
          })
        );
        return fragment;
      })
      .catch(error => {
        dispatch(externalArticleActions.fetchError(error, [id]));
        return null;
      });
}

const insertAndDedupeSiblings = <T extends { id: string; uuid: string }>(
  id: string,
  siblingsSelector: (state: State) => T[],
  // @todo - replace any type
  insertActions: any[],
  // @todo - replace any type
  replaceActionCreator: (strArray: string[]) => any
): ThunkResult<void> => (dispatch: Dispatch, getState: GetState) => {
  dispatch(batchActions(insertActions)); // add it to the state so that we can select it
  const siblings = siblingsSelector(getState());
  const af = keyBy(siblings, ({ uuid }) => uuid)[id];
  const deduped = uniqBy(
    siblings.filter(child => child.id !== af.id || child.uuid === id),
    ({ id: dedupeKey }) => dedupeKey
  ).map(({ uuid }) => uuid);
  // always run this as this may have persist info
  dispatch(replaceActionCreator(deduped));
  return;
};

export {
  updateArticleFragmentMeta,
  articleFragmentsReceived,
  addSupportingArticleFragment,
  removeSupportingArticleFragment,
  replaceArticleFragmentSupporting,
  addGroupArticleFragment,
  removeGroupArticleFragment,
  replaceGroupArticleFragments,
  insertAndDedupeSiblings,
  addArticleFragment
};
