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
    status: CAPIStatus;
    message?: string;
  };
}

const getErrorMessageFromResponse = (response: Response) =>
  `Error making a request to CAPI: the server returned ${response.status}, ${
    response.statusText
  }`;

/**
 * Fetch a CAPI response.
 *
 * @throws If the response fails for any reason.
 */
const fetchCAPIResponse = async <
  TCAPIResponse extends CAPISearchQueryReponse | CAPITagQueryReponse
>(
  request: string
) => {
  let response: Response;
  try {
    response = await fetch(request);
  } catch (e) {
    if (e.status && e.statusText) {
      // pandaFetch can throw a Response or an Error
      throw new Error(getErrorMessageFromResponse(e));
    }
    throw e;
  }
  if (!response.ok) {
    throw new Error(getErrorMessageFromResponse(response));
  }
  let result: TCAPIResponse;
  try {
    result = await response.json();
  } catch (e) {
    throw new Error(`Error parsing a response from CAPI: ${e.message}`);
  }
  if (result.response.status === 'error') {
    throw new Error(`CAPI returned an error: ${result.response.message}`);
  }
  return result;
};

/**
 * Make various CAPI queries.
 *
 * @throws {Error} If fetch throws, CAPI returns an unparsable result, or CAPI returns an error.
 */
const capiQuery = (baseURL: string = API_BASE) => {
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
      return fetchCAPIResponse<CAPISearchQueryReponse>(
        getCAPISearchString(`search`, params, options)
      );
    },
    scheduled: async (
      params: any,
      options?: CAPIOptions
    ): Promise<CAPISearchQueryReponse> => {
      return fetchCAPIResponse<CAPISearchQueryReponse>(
        getCAPISearchString(`content/scheduled`, params, options)
      );
    },
    tags: async (params: any): Promise<CAPITagQueryReponse> => {
      return fetchCAPIResponse<CAPITagQueryReponse>(
        `${baseURL}tags${qs({
          ...params
        })}`
      );
    },
    sections: async (params: any): Promise<CAPITagQueryReponse> => {
      return fetchCAPIResponse<CAPITagQueryReponse>(
        `${baseURL}sections${qs({
          ...params
        })}`
      );
    },
    desks: async (params: any): Promise<CAPITagQueryReponse> => {
      return fetchCAPIResponse<CAPITagQueryReponse>(
        `${baseURL}tags${qs({
          type: 'tracking',
          ...params
        })}`
      );
    }
  };
};

export { Fetch, CapiArticle, CAPISearchQueryReponse, CAPITagQueryReponse };
export default capiQuery;
