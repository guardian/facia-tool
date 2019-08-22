import keyBy from 'lodash/keyBy';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { getContent, transformExternalArticle } from 'services/faciaApi';
import { ThunkResult } from 'types/Store';
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
import { MappableDropType } from 'util/collectionUtils';
import { ExternalArticle } from 'shared/types/ExternalArticle';
import { CapiArticle } from 'types/Capi';
import { ArticleFragment, ArticleFragmentMeta } from '../types/Collection';

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
export const COPY_ARTICLE_FRAGMENT_IMAGE_META =
  'SHARED/COPY_ARTICLE_FRAGMENT_IMAGE_META';

function updateArticleFragmentMeta(
  id: string,
  meta: ArticleFragmentMeta,
  { merge }: { merge: boolean } = { merge: false }
): UpdateArticleFragmentMeta {
  return {
    type: UPDATE_ARTICLE_FRAGMENT_META,
    payload: {
      id,
      meta,
      merge
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

function copyArticleFragmentImageMeta(from: string, to: string) {
  return {
    type: COPY_ARTICLE_FRAGMENT_IMAGE_META as typeof COPY_ARTICLE_FRAGMENT_IMAGE_META,
    payload: { from, to }
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

type TArticleEntities = [ArticleFragment?, ExternalArticle?];

/**
 * Create the appropriate article entities from a MappableDropType,
 * and add them to the application state.
 */
const createArticleEntitiesFromDrop = (
  drop: MappableDropType
): ThunkResult<Promise<ArticleFragment | undefined>> => {
  return async dispatch => {
    const [
      maybeArticleFragment,
      maybeExternalArticle
    ] = await getArticleEntitiesFromDrop(drop);
    if (maybeArticleFragment) {
      dispatch(articleFragmentsReceived([maybeArticleFragment]));
    }
    if (maybeExternalArticle) {
      dispatch(externalArticleActions.fetchSuccess(maybeExternalArticle));
    }
    return maybeArticleFragment;
  };
};

/**
 * Given a resource id, extract the appropriate entities -- an ArticleFragment
 * and possibly an ExternalArticle. The resource id can be a few different things:
 *  - a article, tag or section (either the full URL or the ID)
 *  - an external link.
 */
const getArticleEntitiesFromDrop = async (
  drop: MappableDropType
): Promise<TArticleEntities> => {
  if (drop.type === 'CAPI') {
    return getArticleEntitiesFromFeedDrop(drop.data);
  }
  const resourceIdOrUrl = drop.data;
  const isURL = isValidURL(resourceIdOrUrl);
  const id = isURL ? getIdFromURL(resourceIdOrUrl, true) : resourceIdOrUrl;
  const isNonGuLink = isURL && !id;
  if (isNonGuLink) {
    const fragment = await createLinkSnap(resourceIdOrUrl);
    return [fragment];
  }
  if (!id) {
    return [];
  }
  try {
    const meta = getArticleFragmentMetaFromUrlParams(resourceIdOrUrl);
    if (meta) {
      // If we have gu params in the url, create a snap with the meta we extract.
      const fragment = await createLinkSnap(id, meta);
      return [fragment];
    }
    const {
      articles: [article, ...rest],
      title
    } = await getContent(id);
    if (rest.length) {
      // If we have multiple articles returned from a single resource, we're
      // dealing with a tag or section page.
      return await getArticleEntitiesFromGuardianPath(resourceIdOrUrl, title);
    }
    if (article) {
      // We have a single article from CAPI - create an item as usual.
      return [createFragment(article.id), article];
    }
  } catch (e) {
    if (isURL) {
      // If there was an error getting content for CAPI, assume the link is valid
      // and create a link snap as a fallback. This catches cases like non-tag or
      // section guardian.co.uk URLs, which aren't in CAPI and are sometimes linked.
      const fragment = await createLinkSnap(resourceIdOrUrl);
      return [fragment];
    }
  }
  return [];
};

const getArticleEntitiesFromFeedDrop = (
  capiArticle: CapiArticle
): TArticleEntities => {
  const article = transformExternalArticle(capiArticle);
  const fragment = createFragment(
    article.id,
    article.frontsMeta.defaults.imageHide,
    article.frontsMeta.defaults.imageReplace,
    article.frontsMeta.defaults.imageCutoutReplace,
    article.frontsMeta.cutout,
    article.frontsMeta.defaults.showByline,
    article.frontsMeta.defaults.showQuotedHeadline
  );
  return [fragment, article];
};

const snapMetaWhitelist = [
  'snapCss',
  'snapUri',
  'snapType',
  'headline',
  'trailText'
];
const guPrefix = 'gu-';

/**
 * Given a URL, produce an object with the appropriate meta values.
 */
const getArticleFragmentMetaFromUrlParams = (
  url: string
): ArticleFragmentMeta | undefined => {
  let urlObj: URL | undefined;
  try {
    urlObj = new URL(url);
  } catch (e) {
    // This wasn't a valid URL -- we won't be able to extract values.
    return undefined;
  }
  const guParams = Array.from(urlObj.searchParams).filter(
    ([key]) =>
      true ||
      (key.indexOf(guPrefix) !== -1 &&
        snapMetaWhitelist.indexOf(key.replace(guPrefix, '')) !== -1)
  );
  return guParams.length
    ? guParams.reduce(
        (acc, [key, value]) => ({ ...acc, [key.replace('gu-', '')]: value }),
        {}
      )
    : undefined;
};

const getArticleEntitiesFromGuardianPath = async (
  resourceId: string,
  title?: string
): Promise<TArticleEntities> => {
  const createLatest = window.confirm(
    "Should this snap be a 'Latest' snap? \n \n Click OK to confirm or cancel to create a 'Link' snap by default."
  );
  const fragment = await (createLatest
    ? createLatestSnap(resourceId, title || 'Unknown title')
    : createLinkSnap(resourceId));
  return [fragment];
};

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
  createArticleEntitiesFromDrop,
  clearArticleFragments,
  maybeAddFrontPublicationDate,
  copyArticleFragmentImageMeta
};
