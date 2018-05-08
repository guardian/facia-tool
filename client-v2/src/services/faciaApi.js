// @flow

import pandaFetch from './pandaFetch';
import { getCollectionArticleQueryString } from 'util/collectionUtils';
import { frontStages } from 'constants/fronts';
import type { Article } from 'types/Article';
import type { CollectionArticles } from 'types/Collection';
import type { CapiArticle } from 'types/Capi';

function fetchFrontsConfig() {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  }).then(response => response.json());
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

export type { Collection };
export { fetchFrontsConfig, getCollection, getCollectionArticles };
