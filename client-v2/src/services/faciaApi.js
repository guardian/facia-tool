// @flow

import pandaFetch from './pandaFetch';
import { getCollectionArticleQueryString } from '../util/collectionUtils';
import type { Collection } from '../types/Collection';
import type { CapiArticle } from '../types/Capi';

export function fetchFrontsConfig() {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  }).then(response => response.json());
}

export function getCollection(collectionId: string) {
  return pandaFetch(`/collection/${collectionId}`, {
    method: 'get',
    credentials: 'same-origin'
  }).then(response => response.json());
}

export function getCollectionArticles(
  collection: Collection,
  stage: string = 'preview'
): Promise<Array<CapiArticle>> {
  const ids = getCollectionArticleQueryString(collection);

  if (ids) {
    return pandaFetch(`/api/${stage}/search?ids=${ids}`, {
      method: 'get',
      credentials: 'same-origin'
    })
      .then(response => response.json())
      .then(json =>
        Promise.resolve(
          json.response.results.map(result => ({ headline: result.webTitle }))
        )
      );
  }
  return Promise.resolve([]);
}
