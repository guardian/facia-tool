// @flow

import type { Action } from '../types/Action';
import type { ThunkAction } from '../types/Store';

import { getCollection } from '../services/faciaApi';
import type { Collection } from '../types/Collection';

function frontCollectionReceived(
  collectionId: string,
  collectionDetail: Collection
): Action {
  return {
    type: 'FRONTS_COLLECTION_RECEIVED',
    id: collectionId,
    payload: collectionDetail
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

export default function getFrontCollection(collectionId: string): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestFrontCollection());
    return getCollection(collectionId)
      .then((res: Object) => {
        dispatch(frontCollectionReceived(collectionId, res));
      })
      .catch((error: string) => dispatch(errorReceivingFrontCollection(error)));
  };
}
