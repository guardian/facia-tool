

import v4 from 'uuid/v4';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import keyBy from 'lodash/keyBy';
import type {
  ArticleFragment,
  ArticleFragmentMeta
} from 'shared/types/Collection';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getArticles } from 'services/faciaApi';
import type { State } from 'types/State';
import type { Dispatch } from 'types/Store';
import type { Action } from 'shared/types/Action';
import { batchActions } from 'redux-batched-actions';

function updateArticleFragmentMeta(id: string, meta: ArticleFragmentMeta) {
  return {
    type: 'SHARED/UPDATE_ARTICLE_FRAGMENT_META',
    payload: {
      id,
      meta
    }
  };
}

function articleFragmentsReceived(articleFragments: {
  [string]: ArticleFragment
}) {
  return {
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload: articleFragments
  };
}

function removeSupportingArticleFragment(
  id: string,
  supportingArticleFragmentId: string
) {
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
) => ({
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
) => ({
  type: 'SHARED/ADD_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id,
    articleFragmentId,
    index
  }
});

const removeGroupArticleFragment = (id: string, articleFragmentId: string) => ({
  type: 'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT',
  payload: {
    id,
    articleFragmentId
  }
});

const replaceArticleFragmentSupporting = (
  id: string,
  supporting: string[] = []
) => ({
  type: 'SHARED/REPLACE_ARTICLE_FRAGMENT_SUPPORTING',
  payload: {
    id,
    supporting
  }
});

const replaceGroupArticleFragments = (
  id: string,
  articleFragments: string[] = []
) => ({
  type: 'SHARED/REPLACE_GROUP_ARTICLE_FRAGMENTS',
  payload: {
    id,
    articleFragments
  }
});

const createFragment = (id: string, supporting = []) => ({
  uuid: v4(),
  id,
  frontPublicationDate: Date.now(),
  meta: {
    supporting
  }
});

function addArticleFragment(id: string, supporting: string[] = []) {
  return (dispatch: Dispatch) =>
    getArticles([id, ...supporting])
      .catch(error => dispatch(externalArticleActions.fetchError(error, [id])))
      .then(articles => {
        dispatch(externalArticleActions.fetchSuccess(articles));
        const supportingArray = uniq(supporting).map(createFragment);
        const supportingFragments = keyBy(supportingArray, ({ uuid }) => uuid);
        const parentFragment = createFragment(
          id,
          supportingArray.map(({ uuid }) => uuid)
        );

        dispatch(
          articleFragmentsReceived({
            [parentFragment.uuid]: parentFragment,
            ...supportingFragments
          })
        );
        return parentFragment.uuid;
      });
}

// TODO: handle double dispatching in the same tick
const insertAndDedupeSiblings = <T: { id: string, uuid: string }>(
  id: string,
  siblingsSelector: (state: State) => T[],
  insertActions: Action[],
  replaceActionCreator: (string[]) => Action
) => (dispatch: Dispatch, getState: () => State) => {
  dispatch(batchActions(insertActions)); // add it to the state so that we can select it
  const siblings = siblingsSelector(getState());
  const af = keyBy(siblings, ({ uuid }) => uuid)[id];
  if (!af) return; // this should never happen but Flow
  const deduped = uniqBy(
    siblings.filter(child => child.id !== af.id || child.uuid === id),
    ({ id: dedupeKey }) => dedupeKey
  ).map(({ uuid }) => uuid);
  // always run this as this may have persist info
  dispatch(replaceActionCreator(deduped));
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
