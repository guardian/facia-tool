// @flow

import { qs } from '../util/qs';

const API_BASE = 'https://content.guardianapis.com/';

type Fetch = (path: string) => Promise<Response>;

const capiQuery = (
  baseURL: string = API_BASE,
  fetch: Fetch = window.fetch
) => ({
  search: async (params: Object) => {
    const response = await fetch(
      `${baseURL}search${qs({
        ...params
      })}`
    );

    return response.json();
  }
});

export type { Fetch };
export default capiQuery;
