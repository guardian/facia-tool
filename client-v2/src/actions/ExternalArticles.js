// @flow

import type { Action } from 'types/Action';
import type { ExternalArticle } from 'types/Shared';

function externalArticlesReceived(articles: {
  [string]: ExternalArticle
}): Action {
  return {
    type: 'SHARED/EXTERNAL_ARTICLES_RECEIVED',
    payload: articles
  };
}

function requestCollectionArticles(): Action {
  return {
    type: 'SHARED/EXTERNAL_ARTICLES_GET_RECEIVE',
    receivedAt: Date.now()
  };
}

function errorReceivingCollectionArticles(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch collection articles from capi',
    error,
    receivedAt: Date.now()
  };
}

export {
  externalArticlesReceived,
  requestCollectionArticles,
  errorReceivingCollectionArticles
};
