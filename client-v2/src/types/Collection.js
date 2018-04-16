// @flow

import type { Article } from '../types/Article';

type Collection = {
  draft: Array<Article>,
  live: Array<Article>,
  previously: Array<Article>,
  lastUpdated: number,
  updatedBy: string,
  updatedEmail: string
};

export type { Collection };
