import { Dispatch, ThunkResult } from 'types/Store';
import { Action } from 'types/Action';
import { fetchLastPressed as fetchLastPressedApi } from 'services/faciaApi';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';
import { VisibleArticlesResponse } from 'types/FaciaApi';
import { Stages } from 'shared/types/Collection';
import { State } from 'types/State';
import { getV2Path } from 'selectors/pathSelectors';

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

function recordVisibleArticles(
  collectionId: string,
  visibleArticles: VisibleArticlesResponse,
  stage: Stages
): Action {
  return {
    type: 'FETCH_VISIBLE_ARTICLES_SUCCESS',
    payload: {
      collectionId,
      visibleArticles,
      stage
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

export {
  fetchLastPressed,
  fetchLastPressedSuccess,
  recordVisibleArticles,
  publishCollectionSuccess,
  recordStaleFronts
};

export default function getFrontsConfig(): ThunkResult<
  Promise<
    | ReturnType<typeof frontsConfigActions.fetchSuccess>
    | ReturnType<typeof frontsConfigActions.fetchError>
  >
> {
  return (dispatch: Dispatch, getState: () => State, { fetchFrontsConfig }) => {
    dispatch(frontsConfigActions.fetchStart());
    const promise = fetchFrontsConfig(getV2Path(getState()));
    if (!promise) {
      return Promise.resolve(
        dispatch(
          frontsConfigActions.fetchError('cannot fetch config for this route')
        )
      );
    }
    return promise
      .then(res => {
        return dispatch(frontsConfigActions.fetchSuccess(res));
      })
      .catch((error: string) =>
        dispatch(frontsConfigActions.fetchError(error))
      );
  };
}
