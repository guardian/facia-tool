// @flow

import type { Action } from '../types/Action';
import type { ThunkAction } from '../types/Store';

import { getCollectionArticles } from '../services/faciaApi';
import type { Collection, CollectionArticles } from '../types/Collection';

function collectionArticlesReceived(
  collectionId: string,
  articles: CollectionArticles
): Action {
  return {
    type: 'CAPI_ARTICLES_RECEIVED',
    id: collectionId,
    payload: articles
  };
}

function requestCollectionArticles(): Action {
  return {
    type: 'CAPI_ARTICLES_GET_RECEIVE',
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
  collection: Collection,
  collectionId: string
): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestCollectionArticles());
    return getCollectionArticles(collection)
      .then((res: CollectionArticles) => {
        dispatch(collectionArticlesReceived(collectionId, res));
      })
      .catch((error: string) =>
        dispatch(errorReceivingCollectionArticles(error))
      );
  };
}
