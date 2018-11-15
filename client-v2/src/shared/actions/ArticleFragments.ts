import uniqBy from 'lodash/uniqBy';
import keyBy from 'lodash/keyBy';
import { ArticleFragment, ArticleFragmentMeta } from 'shared/types/Collection';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getContent } from 'services/faciaApi';
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
import { createFragment } from 'shared/util/articleFragment';
import { batchActions } from 'redux-batched-actions';
import { createLinkSnap, createLatestSnap } from 'shared/util/snap';
import { getIdFromURL } from 'util/CAPIUtils';
import { isValidURL } from 'shared/util/url';

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

/**
 * A helper for createArticleFragment.
 */
const persistAndReturnFragment = (
  dispatch: Dispatch,
  fragment: ArticleFragment
) => {
  dispatch(
    articleFragmentsReceived({
      [fragment.uuid]: fragment
    })
  );
  return fragment;
};

/**
 * Given a resource id, create an article fragment and add it to the store.
 * The resource id can be a few different things:
 *  - a article, tag or section (either the full URL or the ID)
 *  - an external link.
 */
function createArticleFragment(
  resourceId: string
): ThunkResult<Promise<ArticleFragment | undefined>> {
  return async (dispatch: Dispatch) => {
    const isURL = isValidURL(resourceId);
    const id = isURL ? getIdFromURL(resourceId) : resourceId;
    if (isURL && !id) {
      // If we have a URL from an external site,
      // create a snap of type 'link'.
      const fragment = await createLinkSnap(resourceId);
      return persistAndReturnFragment(dispatch, fragment);
    }
    if (!id) {
      return;
    }
    try {
      const {
        articles: [article, ...rest],
        title
      } = await getContent(id);
      if (rest.length) {
        // If we have multiple articles returned from a single resource, we're
        // dealing with a tag or section page, and we should create a snap of
        // type 'latest' or 'link'.
        const createLatest = window.confirm(
          "Should this snap be a 'Latest' snap? \n \n Click OK to confirm or cancel to create a 'Link' snap by default."
        );
        const fragment = await (createLatest
          ? createLatestSnap(resourceId, title || 'Unknown title')
          : createLinkSnap(resourceId));
        return persistAndReturnFragment(dispatch, fragment);
      }
      if (article) {
        // We have a single article from CAPI - create an item as usual.
        dispatch(externalArticleActions.fetchSuccess([article]));
        return persistAndReturnFragment(dispatch, createFragment(article.id));
      }
    } catch (e) {
      dispatch(externalArticleActions.fetchError(e.message, [id]));
    }
  };
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
  createArticleFragment
};
