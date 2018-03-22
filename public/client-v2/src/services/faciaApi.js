// @flow

import pandaFetch from './pandaFetch';

export default function getFrontsConfig(reauthUrl: string) {
  return pandaFetch(
    'config',
    {
      method: 'get',
      credentials: 'same-origin'
    },
    reauthUrl
  );
}
