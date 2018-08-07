// @flow

import type { Element } from 'services/capiQuery';

type ExternalArticle = {
  id: string,
  headline: string,
  isLive: boolean,
  firstPublicationDate?: string,
  tone: string,
  sectionName: string,
  elements?: Element[]
};

export type { ExternalArticle };
