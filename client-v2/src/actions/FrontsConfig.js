// @flow

import type { Action } from 'types/Action';
import type { ThunkAction } from 'types/Store';
import type { State } from 'types/State';
import { batchActions } from 'redux-batched-actions';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import {
  getCollectionArticles,
  fetchFrontsConfig,
  type FrontsConfig,
  getCollection
} from 'services/faciaApi';
import { normaliseCollectionWithNestedArticles } from 'util/shared';
import { articleFragmentsReceived } from 'actions/ArticleFragments';
import { externalArticlesReceived } from 'actions/ExternalArticles';
import {
  collectionReceived,
  requestFrontCollection,
  combineCollectionWithConfig,
  errorReceivingFrontCollection,
  populateDraftArticles
} from './Collection';

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
    dispatch(requestFrontCollection());
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
            collectionReceived(collection),
            articleFragmentsReceived(articleFragments)
          ])
        );
        return new Set([ ...collectionWithDraftArticles.draft.map(nestedArticleFragment => nestedArticleFragment.id), ...collectionWithDraftArticles.live.map(nestedArticleFragment => nestedArticleFragment.id)]);
      })
      .catch((error: string) => dispatch(errorReceivingFrontCollection(error)));
  };
}

const getCollectionsAndArticles = (collectionIds: Array<string>) => (
  dispatch: Dispatch
) =>
  Promise.all(
    collectionIds.map(collectionId =>
      dispatch(getFrontCollection(collectionId))
        .then(articleIds => getCollectionArticles(articleIds))
        .then(articles => {
          const articlesMap = articles.reduce(
            (acc, article) => ({
              ...acc,
              [article.id]: article
            }),
            {}
          );
          dispatch(externalArticlesReceived(articlesMap));
        })
    )
  );

export { getFrontCollection, getCollectionsAndArticles };

export default function getFrontsConfig(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestFrontsConfig());
    return fetchFrontsConfig()
      .then((res: Object) => dispatch(frontsConfigReceived(res)))
      .catch((error: string) => dispatch(errorReceivingConfig(error)));
  };
}
