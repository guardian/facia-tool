

import { qs } from 'util/qs';
import type { CapiArticle, Tag } from 'types/Capi';

const API_BASE = 'https://content.guardianapis.com/';

type Fetch = (path: string) => Promise<Response>;

type CAPISearchQueryReponse = {
  response: {
    results: CapiArticle[]
  }
};

type CAPITagQueryReponse = {
  response: {
    results: Tag[]
  }
};

const capiQuery = (
  baseURL: string = API_BASE,
  fetch: Fetch = window.fetch
) => ({
  search: async (params: Object): Promise<CAPISearchQueryReponse> => {
    const response = await fetch(
      `${baseURL}search${qs({
        ...params
      })}`
    );

    return response.json();
  },
  tags: async (params: Object): Promise<CAPITagQueryReponse> => {
    const response = await fetch(
      `${baseURL}tags${qs({
        ...params
      })}`
    );

    return response.json();
  },
  sections: async (params: Object): Promise<CAPITagQueryReponse> => {
    const response = await fetch(
      `${baseURL}sections${qs({
        ...params
      })}`
    );

    return response.json();
  }
});

export type { Fetch, Element, CapiArticle };
export default capiQuery;
