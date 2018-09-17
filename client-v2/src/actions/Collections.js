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
  denormaliseCollection
} from 'shared/util/shared';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import {
  groupsReceived,
  addGroupArticleFragment,
  removeGroupArticleFragment
} from 'shared/actions/Groups';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import type { State } from 'types/State';
import type { Collection } from 'shared/types/Collection';
import { addPersistMetaToAction } from 'util/storeMiddleware';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';

const addGroupArticleFragmentWithPersistence = addPersistMetaToAction(
  addGroupArticleFragment,
  {
    persistTo: 'collection',
    key: 'articleFragmentId'
  }
);

const removeGroupArticleFragmentWithPersistence = addPersistMetaToAction(
  removeGroupArticleFragment,
  {
    persistTo: 'collection',
    applyBeforeReducer: true,
    key: 'articleFragmentId'
  }
);

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
        const hasUnpublishedChanges =
          collectionWithNestedArticles.draft !== undefined;

        const collectionWithDraftArticles = {
          ...collectionWithNestedArticles,
          draft: populateDraftArticles(collectionWithNestedArticles)
        };
        const {
          collection,
          articleFragments,
          groups
        } = normaliseCollectionWithNestedArticles(collectionWithDraftArticles);

        dispatch(
          batchActions([
            collectionActions.fetchSuccess(collection),
            articleFragmentsReceived(articleFragments),
            recordUnpublishedChanges(collectionId, hasUnpublishedChanges),
            groupsReceived(groups)
          ])
        );
        return Object.keys(articleFragments).map(
          afId => articleFragments[afId].id
        );
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
      batchActions([
        collectionActions.updateStart({
          ...collection,
          updatedEmail: selectUserEmail(getState()),
          updatedBy: `${selectFirstName(state)} ${selectLastName(state)}`,
          lastUpdated: Date.now()
        }),
        recordUnpublishedChanges(collection.id, true)
      ])
    );
    try {
      const denormalisedCollection = denormaliseCollection(
        getState(),
        collection.id
      );
      await updateCollectionFromApi(collection.id, denormalisedCollection);
      dispatch(collectionActions.updateSuccess(collection.id));
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
  addGroupArticleFragmentWithPersistence as addGroupArticleFragment,
  removeGroupArticleFragmentWithPersistence as removeGroupArticleFragment
};
