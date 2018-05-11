// @flow

import type { Action } from '../types/Action';
import type { ThunkAction } from '../types/Store';

import { getCollection } from '../services/faciaApi';
import type { Collection } from '../types/Shared';
import type { CollectionConfig } from '../types/CollectionConfig';

function collectionReceived(collection: Collection): Action {
  return {
    type: 'SHARED/COLLECTION_RECEIVED',
    payload: collection
  };
}

function requestFrontCollection(): Action {
  return {
    type: 'FRONTS_COLLECTION_GET_RECEIVE',
    receivedAt: Date.now()
  };
}

function errorReceivingFrontCollection(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch collection',
    error,
    receivedAt: Date.now()
  };
}

const combineCollectionWithConfig = (
  collectionId: string,
  collectionConfig: CollectionConfig,
  collection: Collection
): Collection =>
  Object.assign({}, collection, {
    id: collectionId,
    displayName: collectionConfig.displayName,
    groups: collectionConfig.groups
  });

export default function getFrontCollection(
  collectionId: string,
  collectionConfig: CollectionConfig
): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestFrontCollection());
    return getCollection(collectionId)
      .then((res: Object) => {
        const collection = combineCollectionWithConfig(
          collectionId,
          collectionConfig,
          res
        );
        const { collection, articles } = someTransformFunction(collection);
        dispatch(collectionReceived(collection));
        dispatch(collectionArticlesReceived(articles));
      })
      .catch((error: string) => dispatch(errorReceivingFrontCollection(error)));
  };
}
