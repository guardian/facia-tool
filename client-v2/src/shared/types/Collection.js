// @flow

type NestedArticleFragment = {
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  meta: {
    group?: number,
    supporting?: $Diff<NestedArticleFragment, { supporting: any }>[]
  }
};

type ArticleFragment = $Diff<NestedArticleFragment, { meta: any }> & {
  uuid: string,
  meta: {
    group?: number,
    supporting?: string[]
  }
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
  articleFragments: {
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
  NestedArticleFragment,
  ArticleFragment,
  CollectionWithNestedArticles,
  CollectionResponse,
  Collection
};
