import keyBy from 'lodash/keyBy';
import { ArticleFragment, ArticleFragmentMeta } from 'shared/types/Collection';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getContent } from 'services/faciaApi';
import { Dispatch, ThunkResult } from 'types/Store';
import {
  ArticleFragmentsReceived,
  InsertGroupArticleFragment,
  InsertSupportingArticleFragment,
  RemoveGroupArticleFragment,
  RemoveSupportingArticleFragment,
  UpdateArticleFragmentMeta,
  ClearArticleFragments,
  MaybeAddFrontPublicationDate
} from 'shared/types/Action';
import { createFragment } from 'shared/util/articleFragment';
import { createLinkSnap, createLatestSnap } from 'shared/util/snap';
import { getIdFromURL } from 'util/CAPIUtils';
import { isValidURL } from 'shared/util/url';

export const UPDATE_ARTICLE_FRAGMENT_META =
  'SHARED/UPDATE_ARTICLE_FRAGMENT_META';
export const ARTICLE_FRAGMENTS_RECEIVED = 'SHARED/ARTICLE_FRAGMENTS_RECEIVED';
export const CLEAR_ARTICLE_FRAGMENTS = 'SHARED/CLEAR_ARTICLE_FRAGMENTS';
export const REMOVE_GROUP_ARTICLE_FRAGMENT =
  'SHARED/REMOVE_GROUP_ARTICLE_FRAGMENT';
export const REMOVE_SUPPORTING_ARTICLE_FRAGMENT =
  'SHARED/REMOVE_SUPPORTING_ARTICLE_FRAGMENT';
export const INSERT_GROUP_ARTICLE_FRAGMENT =
  'SHARED/INSERT_GROUP_ARTICLE_FRAGMENT';
export const INSERT_SUPPORTING_ARTICLE_FRAGMENT =
  'SHARED/INSERT_SUPPORTING_ARTICLE_FRAGMENT';

function updateArticleFragmentMeta(
  id: string,
  meta: ArticleFragmentMeta
): UpdateArticleFragmentMeta {
  return {
    type: UPDATE_ARTICLE_FRAGMENT_META,
    payload: {
      id,
      meta
    }
  };
}

// This can accept either a map of article fragments or an array (from which a
// map will be generated)
function articleFragmentsReceived(
  articleFragments:
    | {
        [uuid: string]: ArticleFragment;
      }
    | ArticleFragment[]
): ArticleFragmentsReceived {
  const payload = Array.isArray(articleFragments)
    ? keyBy(articleFragments, ({ uuid }) => uuid)
    : articleFragments;
  return {
    type: ARTICLE_FRAGMENTS_RECEIVED,
    payload
  };
}

function clearArticleFragments(ids: string[]): ClearArticleFragments {
  return {
    type: 'SHARED/CLEAR_ARTICLE_FRAGMENTS',
    payload: {
      ids
    }
  };
}

function removeGroupArticleFragment(
  id: string,
  articleFragmentId: string
): RemoveGroupArticleFragment {
  return {
    type: REMOVE_GROUP_ARTICLE_FRAGMENT,
    payload: {
      id,
      articleFragmentId
    }
  };
}

function removeSupportingArticleFragment(
  id: string,
  articleFragmentId: string
): RemoveSupportingArticleFragment {
  return {
    type: REMOVE_SUPPORTING_ARTICLE_FRAGMENT,
    payload: {
      id,
      articleFragmentId
    }
  };
}

const insertGroupArticleFragment = (
  id: string,
  index: number,
  articleFragmentId: string
): InsertGroupArticleFragment => ({
  type: INSERT_GROUP_ARTICLE_FRAGMENT,
  payload: {
    id,
    index,
    articleFragmentId
  }
});

const insertSupportingArticleFragment = (
  id: string,
  index: number,
  articleFragmentId: string
): InsertSupportingArticleFragment => ({
  type: INSERT_SUPPORTING_ARTICLE_FRAGMENT,
  payload: {
    id,
    index,
    articleFragmentId
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
      if (isURL) {
        // If there was an error getting content for CAPI, assume the link is valid
        // and create a link snap as a fallback. This catches cases like non-tag or
        // section guardian.co.uk URLs, which aren't in CAPI and are sometimes linked.
        const fragment = await createLinkSnap(resourceId);
        return persistAndReturnFragment(dispatch, fragment);
      }
      dispatch(externalArticleActions.fetchError(e.message, [id]));
    }
  };
}

const maybeAddFrontPublicationDate = (
  fragmentId: string
): MaybeAddFrontPublicationDate => ({
  type: 'SHARED/MAYBE_ADD_FRONT_PUBLICATION',
  payload: {
    id: fragmentId,
    date: Date.now()
  }
});

export {
  updateArticleFragmentMeta,
  articleFragmentsReceived,
  insertGroupArticleFragment,
  insertSupportingArticleFragment,
  removeGroupArticleFragment,
  removeSupportingArticleFragment,
  createArticleFragment,
  clearArticleFragments,
  maybeAddFrontPublicationDate
};
