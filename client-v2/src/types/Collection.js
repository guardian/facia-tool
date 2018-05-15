// @flow

import type { CapiArticle } from 'types/Capi';

type CollectionArticles = {
  draft: Array<CapiArticle>,
  live: Array<CapiArticle>
};

export type { CollectionArticles };
