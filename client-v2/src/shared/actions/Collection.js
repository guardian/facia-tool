// @flow

import type { Action } from 'types/Action';

import type { Collection } from 'shared/types/Collection';

function collectionReceived(collection: Collection): Action {
  return {
    type: 'SHARED/COLLECTION_RECEIVED',
    payload: collection
  };
}

export { collectionReceived };
