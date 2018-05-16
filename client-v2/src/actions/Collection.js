// @flow

import type { Action } from 'types/Action';

import type { Collection, CollectionWithNestedArticles } from 'types/Shared';
import type { CollectionConfig } from 'services/faciaApi';

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
  collectionConfig: CollectionConfig,
  collection: CollectionWithNestedArticles
): CollectionWithNestedArticles =>
  Object.assign({}, collection, {
    id: collection.id,
    displayName: collectionConfig.displayName,
    groups: collectionConfig.groups
  });

const populateDraftArticles = (collection: CollectionWithNestedArticles) =>
  !collection.draft ? collection.live : collection.draft;

export {
  collectionReceived,
  requestFrontCollection,
  errorReceivingFrontCollection,
  combineCollectionWithConfig,
  populateDraftArticles
};
