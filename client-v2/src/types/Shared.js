// @flow

type ExternalArticle = {
  id: string,
  headline: string
};

type Meta = {
  group?: number
};

type NestedArticleFragment = {
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  meta: Meta
};

type ArticleFragment = NestedArticleFragment & {
  uuid: string
};

type Article = ExternalArticle & {
  uuid: string,
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  group?: number
};

type CollectionResponse = {
  live: Array<NestedArticleFragment>,
  draft?: Array<NestedArticleFragment>,
  previously?: Array<NestedArticleFragment>,
  lastUpdated?: number,
  updatedBy?: string,
  updatedEmail?: string,
  platform?: string,
  displayName: string,
  groups?: Array<string>
};

type CollectionWithNestedArticles = CollectionResponse & {
  id: string
};

type Collection = {
  articles: {
    [stage: string]: Array<string>
  },
  id: string,
  lastUpdated?: number,
  updatedBy?: string,
  updatedEmail?: string,
  platform?: string,
  displayName: string,
  groups?: Array<string>
};

export type {
  ArticleFragment,
  Article,
  Meta,
  ExternalArticle,
  CollectionWithNestedArticles,
  CollectionResponse,
  Collection
};
