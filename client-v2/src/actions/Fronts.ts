import { Dispatch, ThunkResult } from 'types/Store';
import { Action } from 'types/Action';
import { batchActions } from 'redux-batched-actions';
import {
  fetchFrontsConfig,
  fetchLastPressed as fetchLastPressedApi,
  publishCollection as publishCollectionApi,
  getCollection
} from 'services/faciaApi';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';
import { isFrontStale } from 'util/frontsUtils';

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

function recordStaleFronts(frontId: string, frontIsStale: boolean): Action {
  return {
    type: 'RECORD_STALE_FRONTS',
    payload: {
      [frontId]: frontIsStale
    }
  };
}

function fetchLastPressed(frontId: string): ThunkResult<void> {
  return (dispatch: Dispatch) =>
    fetchLastPressedApi(frontId)
      .then(datePressed =>
        dispatch(fetchLastPressedSuccess(frontId, datePressed))
      )
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

function publishCollection(
  collectionId: string,
  frontId: string
): ThunkResult<Promise<void>> {
  return (dispatch: Dispatch) =>
    publishCollectionApi(collectionId)
      .then(() => {
        dispatch(
          batchActions([
            publishCollectionSuccess(collectionId),
            recordUnpublishedChanges(collectionId, false)
          ])
        );

        return new Promise(resolve => setTimeout(resolve, 10000))
          .then(() =>
            Promise.all([
              getCollection(collectionId),
              fetchLastPressedApi(frontId)
            ])
          )
          .then(([collection, lastPressed]) => {
            const lastPressedInMilliseconds = new Date(lastPressed).getTime();
            dispatch(
              batchActions([
                recordStaleFronts(
                  frontId,
                  isFrontStale(collection.lastUpdated, lastPressedInMilliseconds)
                ),
                fetchLastPressedSuccess(frontId, lastPressed)
              ])
            );
          });
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

export { fetchLastPressed, fetchLastPressedSuccess, publishCollection };

export default function getFrontsConfig(): ThunkResult<
  Promise<
    | ReturnType<typeof frontsConfigActions.fetchSuccess>
    | ReturnType<typeof frontsConfigActions.fetchError>
  >
> {
  return (dispatch: Dispatch) => {
    dispatch(frontsConfigActions.fetchStart());
    return fetchFrontsConfig()
      .then(res => dispatch(frontsConfigActions.fetchSuccess(res)))
      .catch((error: string) =>
        dispatch(frontsConfigActions.fetchError(error))
      );
  };
}
