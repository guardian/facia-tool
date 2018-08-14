// @flow

import { qs } from 'util/qs';

const API_BASE = 'https://content.guardianapis.com/';

type Fetch = (path: string) => Promise<Response>;

type ImageAsset = {
  type: 'image',
  mimeType: string,
  file: string,
  typeData: {
    width: string,
    number: string
  }
};

type ImageElement = {
  id: string,
  relation: string,
  type: 'image',
  assets: ImageAsset[]
};

type Element = ImageElement;

type Article = {
  webTitle: string,
  webUrl: string,
  webPublicationDate?: string,
  elements?: Element[],
  fields?: {
    trailText?: string
  },
  frontsMeta: {
    tone: string
  }
};

type CAPISearchQueryReponse = {
  response: {
    results: Article[]
  }
};

type Tag = {
  id: string,
  webTitle: string,
  webUrl: string
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
  }
});

export type { Fetch, Element };
export default capiQuery;
