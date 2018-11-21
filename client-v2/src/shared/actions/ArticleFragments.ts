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
  InsertArticleFragment,
  RemoveGroupArticleFragment,
  UpdateArticleFragmentMeta
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
    type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
    payload
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

const insertArticleFragment = (
  to: InsertArticleFragment['payload']['to'],
  id: InsertArticleFragment['payload']['id'],
  from: InsertArticleFragment['payload']['from'],
  articleFragmentMap: { [uuid: string]: ArticleFragment }
): InsertArticleFragment => ({
  type: 'SHARED/INSERT_ARTICLE_FRAGMENT',
  payload: {
    to,
    id,
    from,
    articleFragmentMap
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

export {
  updateArticleFragmentMeta,
  articleFragmentsReceived,
  insertArticleFragment,
  removeSupportingArticleFragment,
  removeGroupArticleFragment,
  createArticleFragment
};
