// @flow

import type { Action } from 'types/Action';
import type { ThunkAction } from 'types/Store';
import type { State } from 'types/State';
import { batchActions } from 'redux-batched-actions';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import {
  getArticles,
  fetchFrontsConfig,
  getCollection,
  fetchLastPressed as fetchLastPressedApi
} from 'services/faciaApi';
import type { FrontsConfig } from 'types/FaciaApi';
import {
  combineCollectionWithConfig,
  populateDraftArticles
} from 'util/frontsUtils';
import {
  normaliseCollectionWithNestedArticles,
  getArticleIdsFromCollection
} from 'shared/util/shared';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { actions } from 'shared/bundles/externalArticlesBundle';
import { collectionReceived } from 'shared/actions/Collection';
import { errorReceivingFrontCollection } from './Collection';
import { errorReceivingArticles } from './ExternalArticles';

function frontsConfigReceived(config: FrontsConfig): Action {
  return {
    type: 'FRONTS_CONFIG_RECEIVED',
    payload: config
  };
}

function requestFrontsConfig(): Action {
  return {
    type: 'FRONTS_CONFIG_GET_RECEIVE',
    receivedAt: Date.now()
  };
}

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

function errorReceivingConfig(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch fronts config',
    error,
    receivedAt: Date.now()
  };
}

function getFrontCollection(collectionId: string) {
  return (dispatch: Dispatch, getState: () => State) =>
    getCollection(collectionId)
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
            collectionReceived(collection),
            articleFragmentsReceived(articleFragments)
          ])
        );
        return getArticleIdsFromCollection(collectionWithDraftArticles);
      })
      .catch((error: string) => {
        dispatch(errorReceivingFrontCollection(error));
        return [];
      });
}

const getCollectionsAndArticles = (collectionIds: Array<string>) => (
  dispatch: Dispatch
) =>
  Promise.all(
    collectionIds.map(collectionId =>
      dispatch(getFrontCollection(collectionId))
        .then(articleIds => {
          dispatch(actions.fetchStart(articleIds));
          return getArticles(articleIds).catch(err =>
            dispatch(errorReceivingArticles(err))
          );
        })
        .then(articles => {
          if (!articles) {
            return;
          }
          dispatch(actions.fetchSuccess(articles));
        })
    )
  );

export {
  getFrontCollection,
  getCollectionsAndArticles,
  fetchLastPressed,
  fetchLastPressedSuccess
};

export default function getFrontsConfig(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestFrontsConfig());
    return fetchFrontsConfig()
      .then((res: Object) => dispatch(frontsConfigReceived(res)))
      .catch((error: string) => dispatch(errorReceivingConfig(error)));
  };
}
