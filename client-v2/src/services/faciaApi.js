// @flow

import type {
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap
} from 'types/FaciaApi';
import type { ExternalArticle } from 'shared/types/ExternalArticle';
import type {
  CollectionResponse,
  CollectionWithNestedArticles
} from 'shared/types/Collection';
import pandaFetch from './pandaFetch';

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

function getArticles(articleIds: string[]): Promise<Array<ExternalArticle>> {
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

export { fetchFrontsConfig, getCollection, getArticles };
