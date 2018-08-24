// @flow

import type { ThunkAction } from 'types/Store';
import type { Action } from 'types/Action';
import { batchActions } from 'redux-batched-actions';
import {
  fetchFrontsConfig,
  fetchLastPressed as fetchLastPressedApi,
  publishCollection as publishCollectionApi
} from 'services/faciaApi';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';

function fetchLastPressedSuccess(frontId: string, datePressed: string): Action {
  return {
    type: 'FETCH_LAST_PRESSED_SUCCESS',
    payload: {
      receivedAt: Date.now(),
      frontId,
      datePressed
    }
  };
}

function publishCollectionSuccess(collectionId: string): Action {
  return {
    type: 'PUBLISH_COLLECTION_SUCCESS',
    payload: {
      collectionId
    }
  };
}

function recordStaleFronts(frontId: string, isFrontStale: boolean): Action {
  return {
    type: 'RECORD_STALE_FRONTS',
    payload: {
      frontId: isFrontStale
    }
  };
}

function fetchLastPressed(frontId: string): ThunkAction {
  return (dispatch: Dispatch) =>
    fetchLastPressedApi(frontId)
      .then(datePressed =>
        dispatch(fetchLastPressedSuccess(frontId, datePressed))
        dispatch(recordStaleFronts(frontId, isFrontStale(datePressed)))
      )
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

function publishCollection(collectionId: string): ThunkAction {
  return (dispatch: Dispatch) =>
    publishCollectionApi(collectionId)
      .then(() =>
        dispatch(
          batchActions([
            publishCollectionSuccess(collectionId),
            recordUnpublishedChanges(collectionId, false)
          ])
        )
      )
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

export { fetchLastPressed, fetchLastPressedSuccess, publishCollection };

export default function getFrontsConfig(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(frontsConfigActions.fetchStart());
    return fetchFrontsConfig()
      .then((res: Object) => dispatch(frontsConfigActions.fetchSuccess(res)))
      .catch((error: string) =>
        dispatch(frontsConfigActions.fetchError(error))
      );
  };
}
