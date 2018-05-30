// @flow

import type { CapiArticle } from 'types/Capi';

type CollectionArticles = {
  draft: Array<CapiArticle>,
  live: Array<CapiArticle>
};

type AlsoOnDetail = {
  priorities: Array<string>,
  fronts: Array<{ id: string, priority: string }>,
  meritsWarning: boolean
};

export type { CollectionArticles, AlsoOnDetail };
