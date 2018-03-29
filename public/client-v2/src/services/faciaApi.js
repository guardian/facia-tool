// @flow

import pandaFetch from './pandaFetch';

export default function fetchFrontsConfig() {
  return pandaFetch('/config', {
    method: 'get',
    credentials: 'same-origin'
  }).then(response => response.json());
}
