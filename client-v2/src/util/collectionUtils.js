// @flow

import type { Collection } from '../types/Collection';
import type { Article } from '../types/Article';

const getArticleIds = (
  collection: Collection,
  stage: string
): Array<Article> => {
  if (!collection) {
    return [];
  }

  if (stage === 'draft') {
    // Draft and live versions of the collection are in sync
    if (!collection.draft) {
      return collection.live || [];
    }

    return collection.draft;
  }

  return collection.live;
};

const getCollectionArticleQueryString = (
  collection: Collection,
  stage: string
): string => {
  const articles = getArticleIds(collection, stage);
  return articles
    .map(article => article.id)
    .filter(id => !id.match(/^snap/))
    .join(',');
};

export { getCollectionArticleQueryString };
