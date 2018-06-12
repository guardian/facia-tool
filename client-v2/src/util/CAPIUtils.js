// @flow

import capiQuery from 'services/capiQuery';

const capi = capiQuery();

const getURLCAPIID = (url: string): string | null => {
  const [, id] = url.match(/^https:\/\/www.theguardian\.com\/(.*)\??/) || [];

  return typeof id === 'string' ? id : null;
};

const searchById = (apiKey: string) => async (id: string) =>
  (await capi.search({
    ids: id,
    'api-key': apiKey
  })).response.results[0];

export { getURLCAPIID, searchById };
