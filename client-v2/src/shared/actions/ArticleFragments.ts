import v4 from 'uuid/v4';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import keyBy from 'lodash/keyBy';
import { ArticleFragment, ArticleFragmentMeta } from 'shared/types/Collection';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getArticles } from 'services/faciaApi';
import { State } from 'types/State';
import { Dispatch, ThunkResult } from 'types/Store';
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

const createFragment = (id: string, supporting: string[] = []) => ({
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
        const supportingArray = uniq(supporting).map(_ => createFragment(_));
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
const f = <T1 extends {}>(arg1: T1) => <T2 extends {}>(arg2: T2) => {
  return { arg1, arg2 };
};

const insertAndDedupeSiblings = <T extends { id: string; uuid: string }>(
  id: string,
  siblingsSelector: (state: State) => T[],
  // @todo - replace any type
  insertActions: any[],
  // @todo - replace any type
  replaceActionCreator: (strArray: string[]) => any
): ThunkResult<void> => (dispatch: Dispatch, getState: () => State) => {
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
