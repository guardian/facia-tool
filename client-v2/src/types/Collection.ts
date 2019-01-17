import { CapiArticle } from 'types/Capi';

interface CollectionArticles {
  draft: CapiArticle[];
  live: CapiArticle[];
}

interface AlsoOnDetail {
  priorities: string[];
  fronts: Array<{ id: string; priority: string }>;
  meritsWarning: boolean;
}

export { CollectionArticles, AlsoOnDetail };
