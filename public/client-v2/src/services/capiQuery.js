// @flow

import { qs } from '../util/qs';

const API_BASE = 'https://content.guardianapis.com/';

const capiQuery = (apiKey: string) => ({
  search: async (params: Object) => {
    const response = await fetch(
      `${API_BASE}search${qs({
        ...params,
        'api-key': apiKey
      })}`
    );

    return response.json();
  }
});

export default capiQuery;
