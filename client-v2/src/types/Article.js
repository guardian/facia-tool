// @flow

// TODO: fill this in as we start to display overrides
type Meta = {
  group?: number
};

type Article = {
  id: string,
  frontPublicationDate: number,
  publishedBy: string,
  isLive: boolean,
  firstPublicationDate?: string,
  meta: Meta
};

export type { Article, Meta };
