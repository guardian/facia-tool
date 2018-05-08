// @flow

import type { Article } from 'Types/Article';
import type { CapiArticle } from 'Types/Capi';

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
