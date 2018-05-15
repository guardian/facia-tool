// @flow

import type { Action } from 'types/Action';
import type { ThunkAction } from 'types/Store';

import { getCollectionArticles } from 'services/faciaApi';
import type { CollectionArticles } from 'types/Collection';
import type {
  CollectionWithNestedArticles,
  ExternalArticle
} from 'types/Shared';

function externalArticlesReceived(
  collectionId: string,
  articles: { [string]: ExternalArticle }
): Action {
  return {
    type: 'SHARED/EXTERNAL_ARTICLES_RECEIVED',
    id: collectionId,
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

export default function getArticlesForCollection(
  collection: CollectionWithNestedArticles,
  collectionId: string
): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestCollectionArticles());
    return getCollectionArticles(collection)
      .then((res: Array<ExternalArticle>) => {
        const articlesMap: { [string]: ExternalArticle } = res.reduce(
          (acc, article) => ({
            ...acc,
            [article.id]: article
          }),
          {}
        );
        dispatch(externalArticlesReceived(collectionId, articlesMap));
      })
      .catch((error: string) =>
        dispatch(errorReceivingCollectionArticles(error))
      );
  };
}
