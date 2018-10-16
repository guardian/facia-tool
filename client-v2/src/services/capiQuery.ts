import { qs } from 'util/qs';
import { CapiArticle, Tag } from 'types/Capi';

const API_BASE = 'https://content.guardianapis.com/';

type Fetch = (path: string) => Promise<Response>;

interface CAPISearchQueryReponse {
  response: {
    results: CapiArticle[];
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
  }
});

export { Fetch, CapiArticle, CAPISearchQueryReponse, CAPITagQueryReponse };
export default capiQuery;
