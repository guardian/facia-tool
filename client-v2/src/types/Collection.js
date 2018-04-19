// @flow

import type { Article } from '../types/Article';
import type { CapiArticle } from '../types/Capi';

type Collection = {
  draft?: Array<Article>,
  live: Array<Article>,
  previously?: Array<Article>,
  lastUpdated?: number,
  updatedBy?: string,
  updatedEmail?: string
};

type CollectionArticles = {
  draft: Array<CapiArticle>,
  live: Array<CapiArticle>
};

export type { Collection, CollectionArticles };
