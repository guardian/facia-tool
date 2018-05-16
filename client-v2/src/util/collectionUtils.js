// @flow

import type { CollectionWithNestedArticles } from 'types/Shared';

const getCollectionArticleQueryString = (
  collection: ?CollectionWithNestedArticles,
): string => {
  const articles = getArticlesForStage(collection, stage);
  return articles
    .map(article => article.id)
    .filter(id => !id.match(/^snap/))
    .join(',');
};

export { getCollectionArticleQueryString, getArticlesForStage };
