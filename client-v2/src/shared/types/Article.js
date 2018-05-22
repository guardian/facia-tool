// @flow

import type { ExternalArticle } from './ExternalArticle';

type Article = ExternalArticle & {
  uuid: string,
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  group?: number
};

export type { Article };
