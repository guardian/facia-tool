// @flow

import { isValid } from 'date-fns';

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

function fetchLastPressed(frontId: string, stage: string) {
  // The server does not respond with JSON
  return fetch(`/front/lastmodified/${stage}/${frontId}`).then(
    async (response: Response) => {
      if (response.status !== 200) {
        if (response.status === 404) {
          throw new Error(
            `Tried to fetch last pressed time, but the server couldn't find a front with id ${frontId}`
          );
        }
        const body = await response.text();
        throw new Error(
          `Tried to fetch last pressed time for front with id ${frontId}, but the server responded with ${
            response.status
          }: ${body}`
        );
      }
      const text = await response.text();
      const date = new Date(text);
      if (!isValid(date)) {
        throw new Error(
          `Tried to fetch last pressed time for front with id ${frontId}, but there was an error processing the response`
        );
      }
      return date;
    }
  );
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
        id: result.fields.internalPageCode,
        isLive: result.fields.isLive === 'true',
        firstPublicationDate: result.fields.firstPublicationDate
      }));
    }
    return [];
  };

  const articleIdsWithoutSnaps = articleIds
    .filter(id => !id.match(/^snap/))
    .join(',');

  const articlePromise = pandaFetch(
    `/api/preview/search?ids=${articleIdsWithoutSnaps}&show-fields=internalPageCode,isLive,firstPublicationDate`,
    {
      method: 'get',
      credentials: 'same-origin'
    }
  );

  return articlePromise
    .then(response => response.text())
    .then(articles =>
      Promise.resolve([...parseArticleListFromResponse(articles)])
    );
}

export { fetchFrontsConfig, getCollection, getArticles, fetchLastPressed };
