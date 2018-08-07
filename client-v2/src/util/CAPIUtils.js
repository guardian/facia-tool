// @flow

import capiQuery from 'services/capiQuery';
import type { Element } from 'services/capiQuery';

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

// TODO: get apiKey from context (or speak directly to FrontsAPI)
const getThumbnail = (_elements: Element[]) => {
  const elements = _elements.filter(
    element => element.type === 'image' && element.relation === 'thumbnail'
  );

  if (!elements.length) {
    return null;
  }

  const { assets } = elements[0];

  let smallestAsset = null;

  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i];
    if (
      !smallestAsset ||
      +asset.typeData.width < +smallestAsset.typeData.width
    ) {
      smallestAsset = asset;
    }
  }

  return smallestAsset && smallestAsset.file;
};

export { getURLCAPIID, searchById, getThumbnail };
