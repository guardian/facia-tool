// @flow

import pandaFetch from './pandaFetch';

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

export function searchCapi(stage: string, queryString: string) {
  return pandaFetch(`/api/${stage}/search?${queryString}`, {
    method: 'get',
    credentials: 'same-origin'
  }).then(response => response.json());
}
