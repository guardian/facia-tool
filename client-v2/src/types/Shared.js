// @flow

type ExternalArticle = {
  id: string,
  headline: string
};

type ExternalArticleWithMetadata = ExternalArticle & { group?: number };

type Meta = {
  group?: number
};

type Article = {
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  meta: Meta
};

type Collection = {
  id: string,
  draft?: Array<Article>,
  live: Array<Article>,
  lastUpdated?: number,
  updatedBy?: string,
  updatedEmail?: string,
  platform?: string,
  displayName: string,
  groups?: Array<string>
};

export type {
  Article,
  Meta,
  ExternalArticle,
  ExternalArticleWithMetadata,
  Collection
};
