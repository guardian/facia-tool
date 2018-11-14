import { Dispatch, ThunkResult } from 'types/Store';
import { Action } from 'types/Action';
import { batchActions } from 'redux-batched-actions';
import {
  fetchFrontsConfig,
  fetchLastPressed as fetchLastPressedApi,
  publishCollection as publishCollectionApi,
  getCollection as getCollectionApi
} from 'services/faciaApi';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';
import { isFrontStale } from 'util/frontsUtils';
import { getCollection } from 'actions/Collections';
import { VisibleStoriesResponse } from 'types/FaciaApi';
import { visibleStoriesSelector } from 'selectors/frontsSelectors';
import { ProperStages } from 'shared/types/Collection';
import { properFrontStages } from 'constants/fronts';
import { State } from 'types/State';

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

function recordVisibleStories(collectionId: string, visibleStories: VisibleStoriesResponse, stage: ProperStages): Action {
  return {
    type: 'FETCH_VISIBLE_STORIES_SUCCESS',
    payload: {
      collectionId,
      visibleStories,
      stage
    }
  }
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

  return (dispatch: Dispatch, getState: () => State) => {

  const draftVisibleStories = visibleStoriesSelector(getState(), { collectionId, stage: properFrontStages.draft });

    return publishCollectionApi(collectionId)
      .then(() => {
        dispatch(
          batchActions([
            publishCollectionSuccess(collectionId),
            recordUnpublishedChanges(collectionId, false),
            recordVisibleStories(collectionId, draftVisibleStories, properFrontStages.live)
          ])
        );

        dispatch(getCollection(collectionId));

        return new Promise(resolve => setTimeout(resolve, 10000))
          .then(() =>
            Promise.all([
              getCollectionApi(collectionId),
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
}

export { fetchLastPressed, fetchLastPressedSuccess, publishCollection, recordVisibleStories };

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
