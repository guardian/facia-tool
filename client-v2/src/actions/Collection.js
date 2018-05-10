// @flow

import type { Action } from '../types/Action';
import type { ThunkAction } from '../types/Store';

import { getCollection } from '../services/faciaApi';
import type { CollectionContent } from '../types/Collection';
import type { Collection } from '../types/Shared';
import type { CollectionConfig } from '../types/CollectionConfig';

function frontCollectionReceived(
  collectionId: string,
  collectionDetail: CollectionContent
): Action {
  return {
    type: 'FRONTS_COLLECTION_RECEIVED',
    id: collectionId,
    payload: collectionDetail
  };
}

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
        dispatch(frontCollectionReceived(collectionId, res));
        dispatch(
          collectionReceived(
            combineCollectionWithConfig(collectionId, collectionConfig, res)
          )
        );
      })
      .catch((error: string) => dispatch(errorReceivingFrontCollection(error)));
  };
}
