// @flow

type CapiArticle = {
  id: string,
  headline: string
};

type CapiArticleWithMetadata = CapiArticle & { group?: number };

export type { CapiArticle, CapiArticleWithMetadata };
