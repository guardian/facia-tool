// @flow

import type { Collection } from '../types/Collection';
import type { Article } from '../types/Article';

const getDraftArticles = (collection: Collection): Array<Article> => {
  if (!collection) {
    return [];
  }

  // Draft and live versions of the collection are in sync
  if (!collection.draft) {
    return collection.live || [];
  }

  return collection.draft;
};

const getCollectionArticleQueryString = (collection: Collection): string => {
  const articles = getDraftArticles(collection);
  return articles
    .map(article => article.id)
    .filter(id => !id.match(/^snap/))
    .join(',');
};

export { getCollectionArticleQueryString, getDraftArticles };
