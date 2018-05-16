// @flow

import type { PriorityName } from 'types/Priority';
import type {
  ExternalArticle,
  CollectionResponse,
  CollectionWithNestedArticles
} from 'types/Shared';
import pandaFetch from './pandaFetch';

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

type FrontConfigResponseWithoutPriority = $Diff<
  FrontConfigResponse,
  { priority: PriorityName | void }
>;
type FrontConfig = FrontConfigResponseWithoutPriority & {
  id: string,
  priority: PriorityName
};

type CollectionConfig = CollectionConfigResponse & {
  id: string
};

type FrontConfigMap = {
  [string]: FrontConfig
};

type CollectionConfigMap = {
  [string]: CollectionConfig
};

type FrontsConfig = {
  fronts: FrontConfigMap,
  collections: CollectionConfigMap
};

function fetchFrontsConfig(): Promise<FrontsConfig> {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then((json: FrontsConfigResponse) => ({
      fronts: Object.keys(json.fronts).reduce(
        (acc: FrontConfigMap, id: string): FrontConfigMap => ({
          ...acc,
          [id]: {
            ...json.fronts[id], // $FlowFixMe - this isn't typed properly due to spreading
            id,
            priority: json.fronts[id].priority || 'editorial'
          }
        }),
        {}
      ),
      collections: Object.keys(json.collections).reduce(
        (acc, id) => ({
          ...acc,
          [id]: {
            ...json.collections[id],
            id
          }
        }),
        {}
      )
    }));
}

function getCollection(
  collectionId: string
): Promise<CollectionWithNestedArticles> {
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
  articleIds: string[]
): Promise<Array<ExternalArticle>> {
  const parseArticleListFromResponse = (
    text: ?string
  ): Array<ExternalArticle> => {
    if (text) {
      return JSON.parse(text).response.results.map(result => ({
        headline: result.webTitle,
        id: result.fields.internalPageCode
      }));
    }
    return [];
  };

  const articleIdsWithoutSnaps = articleIds
    .filter(id => !id.match(/^snap/))
    .join(',');

  const liveArticlePromise = pandaFetch(
    `/api/live/search?ids=${articleIdsWithoutSnaps}&show-fields=internalPageCode`,
    {
      method: 'get',
      credentials: 'same-origin'
    }
  );

  return liveArticlePromise
    .then(response => response.text())
    .then(articles =>
      Promise.resolve([...parseArticleListFromResponse(articles)])
    );
}

export type { CollectionConfig, FrontConfig, FrontsConfig };
export { fetchFrontsConfig, getCollection, getCollectionArticles };
