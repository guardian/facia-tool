import uniq from 'lodash/uniq';
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
import { groupsReceived } from 'shared/actions/Groups';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { Dispatch, ThunkResult } from 'types/Store';
import { Collection } from 'shared/types/Collection';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';

function getCollection(collectionId: string): ThunkResult<Promise<string[]>> {
  return (dispatch: Dispatch, getState: () => State) => {
    dispatch(collectionActions.fetchStart(collectionId));
    return fetchCollection(collectionId)
      .then(res => {
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
        } = normaliseCollectionWithNestedArticles(
          collectionWithDraftArticles,
          collectionConfig
        );

        dispatch(
          batchActions([
            collectionActions.fetchSuccess(collection),
            articleFragmentsReceived(articleFragments),
            recordUnpublishedChanges(collectionId, hasUnpublishedChanges),
            groupsReceived(groups)
          ])
        );

        // We dedupe ids here to ensure that articles aren't requested twice,
        // e.g. multiple articles containing the same supporting article.
        return uniq(
          Object.keys(articleFragments).map(afId => articleFragments[afId].id)
        );
      })
      .catch((error: string) => {
        dispatch(collectionActions.fetchError(error, collectionId));
        return [];
      });
  };
}

function updateCollection(collection: Collection): ThunkResult<Promise<void>> {
  return async (dispatch: Dispatch, getState: () => State) => {
    const state = getState();
    dispatch(
      batchActions([
        collectionActions.updateStart({
          ...collection,
          updatedEmail: selectUserEmail(getState()) || '',
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
      dispatch(collectionActions.updateSuccess(collection.id, collection));
    } catch (e) {
      dispatch(collectionActions.updateError(e, collection.id));
      throw e;
    }
  };
}

const getCollectionsAndArticles = (
  collectionIds: string[],
  getCollectionAction = getCollection
): ThunkResult<Promise<void[]>> => (dispatch: Dispatch) =>
  Promise.all(
    collectionIds.map(async collectionId => {
      // @todo - requires correct handling of Dispatch thunks
      const articleIds = await dispatch(getCollectionAction(collectionId));
      dispatch(externalArticleActions.fetchStart(articleIds));
      try {
        const articles = await getArticles(articleIds);
        dispatch(externalArticleActions.fetchSuccess(articles));
      } catch (e) {
        dispatch(externalArticleActions.fetchError(e.message, articleIds));
      }
    })
  );

export { getCollection, getCollectionsAndArticles, updateCollection };
