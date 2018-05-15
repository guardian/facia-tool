// @flow

import type { Article } from 'types/Article';

const liveArticle: Article = {
  id: 'article/live/0',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const draftArticle: Article = {
  id: 'article/draft/1',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

const draftArticleInGroup: Article = {
  id: 'article/draft/2',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: { group: 1 }
};

const snapArticle: Article = {
  id: 'snap/link/3',
  frontPublicationDate: 1,
  publishedBy: 'Computers',
  meta: {}
};

export { liveArticle, draftArticle, snapArticle, draftArticleInGroup };
