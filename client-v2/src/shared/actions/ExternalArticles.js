import type { ExternalArticle } from '../types/ExternalArticle';

function externalArticlesReceived(articles: {
  [string]: ExternalArticle
}): Action {
  return {
    type: 'SHARED/EXTERNAL_ARTICLES_RECEIVED',
    payload: articles
  };
}

export { externalArticlesReceived };
