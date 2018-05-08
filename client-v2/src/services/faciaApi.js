// @flow

import pandaFetch from './pandaFetch';
import { getCollectionArticleQueryString } from 'util/collectionUtils';
import { frontStages } from 'constants/fronts';
import type { Article } from 'types/Article';
import type { CollectionArticles } from 'types/Collection';
import type { CapiArticle } from 'types/Capi';
import type { PriorityName } from 'types/Priority';

type ObjectOfObjects<T: Object> = {
  [string]: T
};

type ObjectOfObjectsWithIds<T: Object> = {
  [string]: T & { id: string }
};

const addIdToEntries = <T: Object>(
  obj: ObjectOfObjects<T>
): ObjectOfObjectsWithIds<T> =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...obj[key],
        id: key
      }
    }),
    {}
  );

type FrontConfigResponse = {
  collections: Array<string>,
  priority?: PriorityName,
  canonical?: string,
  group?: string,
  isHidden?: boolean,
  isImageDisplayed?: boolean,
  imageHeight?: number,
  imageWidth?: number,
  imageUrl?: string,
  onPageDescription?: string,
  description?: string,
  title?: string,
  webTitle?: string,
  navSection?: string
};

type Platform = 'Web' | 'Platform';

type CollectionConfigResponse = {
  displayName: string,
  type: string,
  backfill?: Object,
  href?: string,
  groups?: Array<string>,
  metadata?: Array<Object>,
  platform?: string,
  uneditable?: boolean,
  showTags?: boolean,
  hideKickers?: boolean,
  excludedFromRss?: boolean,
  description?: string,
  showSections?: boolean,
  showDateHeader?: boolean,
  showLatestUpdate?: boolean,
  excludeFromRss?: boolean,
  hideShowMore?: boolean,
  platform?: Platform
};

type FrontsConfigResponse = {
  fronts: {
    [string]: FrontConfigResponse
  },
  collections: {
    [string]: CollectionConfigResponse
  }
};

type FrontConfig = FrontConfigResponse & {
  id: string
};

type CollectionConfig = CollectionConfigResponse & {
  id: string
};

type FrontsConfig = {
  fronts: {
    [string]: FrontConfig
  },
  collections: {
    [string]: CollectionConfig
  }
};

function fetchFrontsConfig(): Promise<FrontsConfig> {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: FrontsConfigResponse) => ({
      fronts: addIdToEntries(json.fronts),
      collections: addIdToEntries(json.collections)
    }));
}

type CollectionResponse = {
  draft?: Array<Article>,
  live: Array<Article>,
  previously?: Array<Article>,
  lastUpdated?: number,
  updatedBy?: string,
  updatedEmail?: string
};

type Collection = CollectionResponse & {
  id: string
};

function getCollection(collectionId: string): Promise<Collection> {
  return pandaFetch(`/collection/${collectionId}`, {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: CollectionResponse) => ({
      ...json,
      id: collectionId
    }));
}

function getCollectionArticles(
  collection: Collection
): Promise<CollectionArticles> {
  const parseArticleListFromResponse = (text: ?string): Array<CapiArticle> => {
    if (text) {
      return JSON.parse(text).response.results.map(result => ({
        headline: result.webTitle,
        id: result.fields.internalPageCode
      }));
    }
    return [];
  };

  const draftIds = getCollectionArticleQueryString(
    collection,
    frontStages.draft
  );
  const liveIds = getCollectionArticleQueryString(collection, frontStages.live);

  const draftArticlePromise = pandaFetch(
    `/api/preview/search?ids=${draftIds}&show-fields=internalPageCode`,
    {
      method: 'get',
      credentials: 'same-origin'
    }
  );

  const liveArticlePromise = pandaFetch(
    `/api/live/search?ids=${liveIds}&show-fields=internalPageCode`,
    {
      method: 'get',
      credentials: 'same-origin'
    }
  );

  return Promise.all([draftArticlePromise, liveArticlePromise])
    .then(responses => Promise.all(responses.map(response => response.text())))
    .then(([draft, live]) =>
      Promise.resolve({
        draft: parseArticleListFromResponse(draft),
        live: parseArticleListFromResponse(live)
      })
    );
}

export type { Collection, CollectionConfig, FrontConfig, FrontsConfig };
export { fetchFrontsConfig, getCollection, getCollectionArticles };
