// @flow

import get from 'lodash/get';
import { getArticles } from 'services/faciaApi';
import type { Element } from 'types/Capi';
import type { ExternalArticle } from '../shared/types/ExternalArticle';
import type { ArticleFragment } from '../shared/types/Collection';

const getInternalPageCode = async (id: string) =>
  ((await getArticles([id]))[0] || {}).id || null;

const getURLInternalPageCode = async (url: string): Promise<string | null> => {
  const [, id] = url.match(/^https:\/\/www.theguardian\.com\/(.*)\??/) || [];
  return typeof id !== 'string'
    ? Promise.resolve(null)
    : getInternalPageCode(id);
};

// TODO: get apiKey from context (or speak directly to FrontsAPI)
const getThumbnailFromElements = (_elements: Element[]) => {
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

export { getURLInternalPageCode, getThumbnailFromElements };
