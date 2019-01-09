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

interface CAPIOptions {
  // Does the query represent a single resource, e.g. an article or a
  // tag/section page? If so, we need to make a slightly different query.
  // We can't derive it from the query string becuase it has already been
  // trimmed of everything but its path and parameters.
  isResource: boolean;
}

interface CAPITagQueryReponse {
  response: {
    results: Tag[];
  };
}

const capiQuery = (baseURL: string = API_BASE, fetch: Fetch = window.fetch) => {
  const getCAPISearchString = (
    path: string,
    params: any,
    options?: CAPIOptions
  ) => {
    const { q, ...rest } = params;
    return options && options.isResource
      ? `${baseURL}${q}${qs({ ...rest })}`
      : `${baseURL}${path}${qs({
          ...params
        })}`;
  };

  return {
    search: async (
      params: any,
      options?: CAPIOptions
    ): Promise<CAPISearchQueryReponse> => {
      const response = await fetch(
        getCAPISearchString(`search`, params, options)
      );

      return response.json();
    },
    scheduled: async (
      params: any,
      options?: CAPIOptions
    ): Promise<CAPISearchQueryReponse> => {
      const response = await fetch(
        getCAPISearchString(`content/scheduled`, params, options)
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
  };
};

export { Fetch, CapiArticle, CAPISearchQueryReponse, CAPITagQueryReponse };
export default capiQuery;
