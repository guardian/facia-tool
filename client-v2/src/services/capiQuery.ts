import { qs } from 'util/qs';
import { CapiArticle, Tag } from 'types/Capi';

const API_BASE = 'https://content.guardianapis.com/';

type Fetch = (path: string) => Promise<Response>;

type CAPIStatus = 'ok' | 'error';

interface CAPISearchQueryReponse {
  response: {
    results?: CapiArticle[];
    content?: CapiArticle;
    tag?: Tag;
    section?: {
      webTitle: string;
    };
    status: CAPIStatus;
    message?: string;
  };
}

interface CAPITagQueryReponse {
  response: {
    results: Tag[];
  };
}

const capiQuery = (
  baseURL: string = API_BASE,
  fetch: Fetch = window.fetch
) => ({
  search: async (params: any): Promise<CAPISearchQueryReponse> => {
    const response = await fetch(
      `${baseURL}search${qs({
        ...params
      })}`
    );

    return response.json();
  },
  scheduled: async (params: any): Promise<CAPISearchQueryReponse> => {
    const response = await fetch(
      `${baseURL}content/scheduled${qs({
        ...params
      })}`
    );

    return response.json();
  },
  tags: async (params: any): Promise<CAPITagQueryReponse> => {
    const response = await fetch(
      `${baseURL}tags${qs({
        ...params
      })}`
    );

    return response.json();
  },
  sections: async (params: any): Promise<CAPITagQueryReponse> => {
    const response = await fetch(
      `${baseURL}sections${qs({
        ...params
      })}`
    );

    return response.json();
  },
  desks: async (params: any): Promise<CAPITagQueryReponse> => {
    const response = await fetch(
      `${baseURL}tags${qs({
        type: 'tracking',
        ...params
      })}`
    );

    return response.json();
  }
});

export { Fetch, CapiArticle, CAPISearchQueryReponse, CAPITagQueryReponse };
export default capiQuery;
