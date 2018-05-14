// @flow

import { frontStages } from 'constants/fronts';
import type { Collection } from 'services/faciaApi';
import type { Article } from 'types/Article';

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
