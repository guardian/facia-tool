// @flow

import isValid from 'date-fns/is_valid';
import type {
  FrontsConfig,
  FrontsConfigResponse,
  FrontConfigMap
} from 'types/FaciaApi';
import type { ExternalArticle } from 'shared/types/ExternalArticle';
import type {
  CollectionResponse,
  CollectionWithNestedArticles,
  NestedArticleFragment
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

async function fetchLastPressed(frontId: string): Promise<string> {
  // The server does not respond with JSON
  return pandaFetch(`/front/lastmodified/${frontId}`)
    .then(response => response.text())
    .then(date => {
      if (!date || !isValid(new Date(date))) {
        throw new Error(
          `Tried to fetch last pressed time for front with id ${frontId}, but there was an error processing the response, which was ${date}`
        );
      }
      return date;
    })
    .catch(response => {
      throw new Error(
        `Tried to fetch last pressed time for front with id ${frontId}, but the server responded with ${
          response.status
        }: ${response.body}`
      );
    });
}

async function publishCollection(collectionId: string): Promise<void> {
  // The server does not respond with JSON
  try {
    await pandaFetch(`/collection/publish/${collectionId}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ collectionId })
    });
  } catch (response) {
    throw new Error(
      `Tried to publish collection with id ${collectionId}, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function updateCollection(
  id: string,
  collection: CollectionWithNestedArticles
): Promise<CollectionWithNestedArticles> {
  try {
    const response = await pandaFetch(`/v2Edits`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ id, collection })
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to update collection with id ${id}, but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function getClipboard(): Promise<Array<NestedArticleFragment>> {
  // The server does not respond with JSON
  try {
    const response = await pandaFetch(`/clipboard`, {
      method: 'get',
      credentials: 'same-origin'
    });
    return await response.json();
  } catch (response) {
    if (response.status === '404') {
      return [];
    }
    throw new Error(
      `Tried to fetch a clipboard but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
}

async function saveClipboard(clipboardContent: Array<NestedArticleFragment>): Promise<Array<NestedArticleFragment>> {
  // The server does not respond with JSON
  try {
    const response = await pandaFetch(`/clipboard`, {
      method: 'post',
      credentials: 'same-origin',
      body: JSON.stringify(clipboardContent),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (response) {
    throw new Error(
      `Tried to update a clipboard but the server responded with ${
        response.status
      }: ${response.body}`
    );
  }
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
        id: `internal-code/page/${result.fields.internalPageCode}`,
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

export {
  fetchFrontsConfig,
  getCollection,
  getArticles,
  fetchLastPressed,
  publishCollection,
  updateCollection,
  getClipboard,
  saveClipboard
};
