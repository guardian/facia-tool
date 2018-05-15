// @flow

import type { Action } from 'types/Action';
import type { ThunkAction } from 'types/Store';
import { getCollection } from 'services/faciaApi';
import type { Collection, CollectionWithNestedArticles } from 'types/Shared';
import type { ConfigCollectionResponse } from 'services/faciaApi';
import { normaliseCollectionWithNestedArticles } from 'util/shared';
import { articleFragmentsReceived } from 'actions/articleFragments';

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
  collectionConfig: ConfigCollectionResponse,
  collection: CollectionWithNestedArticles
): CollectionWithNestedArticles =>
  Object.assign({}, collection, {
    id: collection.id,
    displayName: collectionConfig.displayName,
    groups: collectionConfig.groups
  });

export default function getFrontCollection(
  collectionConfig: ConfigCollectionResponse
): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestFrontCollection());
    return getCollection(collectionConfig.id)
      .then((res: Object) => {
        const collectionWithNestedArticles = combineCollectionWithConfig(
          collectionConfig,
          res
        );
        const {
          collection,
          articleFragments
        } = normaliseCollectionWithNestedArticles(collectionWithNestedArticles);
        dispatch(collectionReceived(collection));
        dispatch(articleFragmentsReceived(articleFragments));
      })
      .catch((error: string) => dispatch(errorReceivingFrontCollection(error)));
  };
}
