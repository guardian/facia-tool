// @flow

import { batchActions } from 'redux-batched-actions';
import {
  getArticles,
  getCollection as fetchCollection,
  updateCollection as updateCollectionFromApi
} from 'services/faciaApi';
import {
  selectUserEmail,
  selectFirstName,
  selectLastName
} from 'selectors/configSelectors';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import {
  combineCollectionWithConfig,
  populateDraftArticles
} from 'util/frontsUtils';
import {
  normaliseCollectionWithNestedArticles,
  getArticleIdsFromCollection,
  denormaliseCollection
} from 'shared/util/shared';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import {
  addCollectionArticleFragment,
  removeCollectionArticleFragment
} from 'shared/actions/Collection';
import type { State } from 'types/State';
import type { Collection } from 'shared/types/Collection';

/**
 * We add the persistence middleware meta to actions we'd like to trigger persist
 * operations here - see the persistCollectionOnEdit middleware.
 */
function addCollectionArticleFragmentWithPersistence(...args: *) {
  return {
    ...addCollectionArticleFragment(...args),
    meta: {
      persistTo: 'collection',
      key: 'articleFragmentId',
      applyBeforeReducer: true
    }
  };
}

function removeCollectionArticleFragmentWithPersistence(...args: *) {
  return {
    ...removeCollectionArticleFragment(...args),
    meta: {
      persistTo: 'collection',
      key: 'articleFragmentId'
    }
  };
}

function getCollection(collectionId: string) {
  return (dispatch: Dispatch, getState: () => State) => {
    dispatch(collectionActions.fetchStart(collectionId));
    return fetchCollection(collectionId)
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

function updateCollection(collection: Collection) {
  return async (dispatch: Dispatch, getState: () => State) => {
    const state = getState();
    dispatch(
      collectionActions.updateStart({
        ...collection,
        updatedEmail: selectUserEmail(getState()),
        updatedBy: `${selectFirstName(state)} ${selectLastName(state)}`,
        lastUpdated: Date.now()
      })
    );
    try {
      const denormalisedCollection = denormaliseCollection(
        getState(),
        collection.id
      );
      await updateCollectionFromApi(collection.id, denormalisedCollection);
    } catch (e) {
      dispatch(collectionActions.updateError(e, collection.id));
      throw e;
    }
  };
}

const getCollectionsAndArticles = (collectionIds: Array<string>) => (
  dispatch: Dispatch
) =>
  Promise.all(
    collectionIds.map(collectionId =>
      dispatch(getCollection(collectionId))
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
  getCollection,
  getCollectionsAndArticles,
  updateCollection,
  addCollectionArticleFragmentWithPersistence as addCollectionArticleFragment,
  removeCollectionArticleFragmentWithPersistence as removeCollectionArticleFragment
};
