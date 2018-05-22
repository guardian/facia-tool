// @flow

import type { ExternalArticle } from './ExternalArticle';
import type { Collection, ArticleFragment } from './Collection';

type CollectionReceivedAction = {
  type: 'SHARED/COLLECTION_RECEIVED',
  payload: Collection
};
type ExternalArticlesReceived = {
  type: 'SHARED/EXTERNAL_ARTICLES_RECEIVED',
  payload: { [string]: ExternalArticle }
};
type RequestCollectionArticles = {
  type: 'SHARED/EXTERNAL_ARTICLES_GET_RECEIVE',
  receivedAt: number
};
type ArticleFragmentsReceived = {
  type: 'SHARED/ARTICLE_FRAGMENTS_RECEIVED',
  payload: { [string]: ArticleFragment }
};

type Action =
  | CollectionReceivedAction
  | ExternalArticlesReceived
  | RequestCollectionArticles
  | ArticleFragmentsReceived;

export type { Action };
