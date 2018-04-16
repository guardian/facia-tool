// @flow

import { searchCapi } from '../services/faciaApi';
import type { Collection } from '../types/Collection';
import type { Article } from '../types/Article';
import type { CapiArticle } from '../types/Capi';

const getDraftArticles = (collection: ?Collection): Array<Article> => {
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
  collection: Collection
): Promise<Array<CapiArticle>> => {
  if (!collection) {
    return Promise.resolve([]);
  }

  const articles = getDraftArticles(collection);
  const idsToFetch = articles
    .map(article => article.id)
    .filter(id => !id.match(/^snap/))
    .join(',');

  if (idsToFetch) {
    return searchCapi('preview', `ids=${idsToFetch}`).then(response =>
      response.response.results.map(result => ({ headline: result.webTitle }))
    );
  }
  return Promise.resolve([]);
};

export { getArticlesForCollection };
