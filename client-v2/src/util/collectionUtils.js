// @flow

import { frontStages } from 'Constants/fronts';
import type { Collection } from 'Types/Collection';
import type { Article } from 'Types/Article';

const getArticlesForStage = (
  collection: ?Collection,
  stage: string
): Array<Article> => {
  if (!collection) {
    return [];
  }

  if (stage === frontStages.draft) {
    // Draft and live versions of the collection are in sync
    if (!collection.draft) {
      return collection.live || [];
    }

    return collection.draft;
  }

  return collection.live;
};

const getCollectionArticleQueryString = (
  collection: ?Collection,
  stage: string
): string => {
  const articles = getArticlesForStage(collection, stage);
  return articles
    .map(article => article.id)
    .filter(id => !id.match(/^snap/))
    .join(',');
};

export { getCollectionArticleQueryString, getArticlesForStage };
