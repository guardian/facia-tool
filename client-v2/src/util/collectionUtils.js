// @flow

import { searchCapi } from '../services/faciaApi';
import type { FrontCollectionDetail, Article } from '../types/Fronts';

const getDraftArticles = (
  collection: FrontCollectionDetail
): Array<Article> => {
  if (!collection) {
    return [];
  }

  // Draft and live versions of the collection are in sync
  if (!collection.draft) {
    return collection.live;
  }

  return collection.draft;
};

const getArticlesForCollection = (
  collection: FrontCollectionDetail
): Promise<Array<Object>> => {
  if (!collection) {
    return Promise.resolve([]);
  }

  const articles = getDraftArticles(collection);
  const idsToFetch = articles.map(article => article.id).join(',');

  return (
    searchCapi('preview', `ids=${idsToFetch}`)
      // What is this actually returnig???
      .then(response =>
        response.response.results.map(result => ({ headline: result.webTitle }))
      )
  );
};

export { getArticlesForCollection };
