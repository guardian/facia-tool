// @flow

import type { Element } from 'services/capiQuery';

type ExternalArticle = {
  id: string,
  headline: string,
  isLive: boolean,
  urlPath: string,
  firstPublicationDate?: string,
  tone: string,
  sectionName: string,
  elements?: Element[]
};

export type { ExternalArticle };
