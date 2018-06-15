// @flow

import type { ThunkAction } from 'types/Store';
import type { State } from 'types/State';
import type { Action } from 'types/Action';
import { batchActions } from 'redux-batched-actions';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import {
  getArticles,
  fetchFrontsConfig,
  getCollection,
  fetchLastPressed as fetchLastPressedApi,
  publishCollection as publishCollectionApi
} from 'services/faciaApi';
import {
  combineCollectionWithConfig,
  populateDraftArticles
} from 'util/frontsUtils';
import {
  normaliseCollectionWithNestedArticles,
  getArticleIdsFromCollection
} from 'shared/util/shared';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { actions as frontsConfigActions } from 'bundles/frontsConfigBundle';

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
      receivedAt: Date.now(),
      collectionId
    }
  };
}

function fetchLastPressed(frontId: string): ThunkAction {
  return (dispatch: Dispatch) =>
    fetchLastPressedApi(frontId)
      .then(datePressed =>
        dispatch(fetchLastPressedSuccess(frontId, datePressed))
      )
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

function publishCollection(collectionId: string): ThunkAction {
  return (dispatch: Dispatch) =>
    publishCollectionApi(collectionId)
      .then(response => dispatch(publishCollectionSuccess(collectionId))
      )
      .catch(() => {
        // @todo: implement once error handling is done
      });
}

function errorReceivingConfig(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch fronts config',
    error,
    receivedAt: Date.now()
  };
}

function getFrontCollection(collectionId: string) {
  return (dispatch: Dispatch, getState: () => State) => {
    dispatch(collectionActions.fetchStart(collectionId));
    return getCollection(collectionId)
      .then((res: Object) => {
        const collectionConfig = getCollectionConfig(getState(), collectionId);
        const collectionWithNestedArticles = combineCollectionWithConfig(
          collectionConfig,
          res
        );
        const collectionWithDraftArticles = {
          ...collectionWithNestedArticles,
          draft: populateDraftArticles(collectionWithNestedArticles)
        };
        const {
          collection,
          articleFragments
        } = normaliseCollectionWithNestedArticles(collectionWithDraftArticles);

        dispatch(
          batchActions([
            collectionActions.fetchSuccess(collection),
            articleFragmentsReceived(articleFragments)
          ])
        );
        return getArticleIdsFromCollection(collectionWithDraftArticles);
      })
      .catch((error: string) => {
        dispatch(collectionActions.fetchError(error, collectionId));
        return [];
      });
  };
}

const getCollectionsAndArticles = (collectionIds: Array<string>) => (
  dispatch: Dispatch
) =>
  Promise.all(
    collectionIds.map(collectionId =>
      dispatch(getFrontCollection(collectionId))
        .then(articleIds => {
          dispatch(externalArticleActions.fetchStart(articleIds));
          return getArticles(articleIds).catch(error =>
            dispatch(externalArticleActions.fetchError(error, articleIds))
          );
        })
        .then(articles => {
          dispatch(externalArticleActions.fetchSuccess(articles));
        })
    )
  );

export {
  getFrontCollection,
  getCollectionsAndArticles,
  fetchLastPressed,
  fetchLastPressedSuccess,
  publishCollection
};

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
