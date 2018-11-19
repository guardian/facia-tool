import uniq from 'lodash/uniq';
import { batchActions } from 'redux-batched-actions';
import {
  getArticlesBatched,
  getCollection as fetchCollection,
  updateCollection as updateCollectionFromApi,
  fetchVisibleArticles
} from 'services/faciaApi';
import { VisibleArticlesResponse } from 'types/FaciaApi';
import {
  selectUserEmail,
  selectFirstName,
  selectLastName
} from 'selectors/configSelectors';
import {
  createGroupArticlesSelector,
  selectSharedState
} from 'shared/selectors/shared';
import { actions as externalArticleActions } from 'shared/bundles/externalArticlesBundle';
import {
  combineCollectionWithConfig,
  populateDraftArticles,
  getVisibilityArticleDetails,
  getGroupsByStage
} from 'util/frontsUtils';
import {
  normaliseCollectionWithNestedArticles,
  denormaliseCollection
} from 'shared/util/shared';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { groupsReceived } from 'shared/actions/Groups';
import { recordVisibleArticles } from 'actions/Fronts';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { getCollectionConfig } from 'selectors/frontsSelectors';
import { State } from 'types/State';
import { Dispatch, ThunkResult, GetState } from 'types/Store';
import { frontStages } from 'constants/fronts';
import { Stages, Collection } from 'shared/types/Collection';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';
import difference from 'lodash/difference';

function getCollection(collectionId: string): ThunkResult<Promise<string[]>> {
  return async (dispatch: Dispatch, getState: () => State) => {
    dispatch(collectionActions.fetchStart(collectionId));
    try {
      const res = await fetchCollection(collectionId)
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
          groupsReceived(groups),
        ])
      );

      const state = getState();
      const liveVisibleArticles = await getVisibleArticles(collection, state, frontStages.live);
      const draftVisibleArticles = await getVisibleArticles(collection, state, frontStages.draft);

      dispatch(
        batchActions([
          recordVisibleArticles(collection.id, liveVisibleArticles, frontStages.live),
          recordVisibleArticles(collection.id, draftVisibleArticles, frontStages.draft)
        ])
      );

      // We dedupe ids here to ensure that articles aren't requested twice,
      // e.g. multiple articles containing the same supporting article.
      return uniq(
        Object.keys(articleFragments).map(afId => articleFragments[afId].id)
      );
    } catch (error) {
      dispatch(collectionActions.fetchError(error, collectionId));
      return [];
    };
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
      dispatch(collectionActions.updateSuccess(collection.id, collection))
      const visibleArticles = await getVisibleArticles(collection, getState(), frontStages.draft)
      dispatch(recordVisibleArticles(collection.id, visibleArticles, frontStages.draft))
    } catch (e) {
      dispatch(collectionActions.updateError(e, collection.id));
      throw e;
    }
  };
}

/**
 * Fetch articles from CAPI and add them to the store.
 */
const fetchArticles = (articleIds: string[]) => async (dispatch: Dispatch) => {
  const articleIdsWithoutSnaps = articleIds.filter(id => !id.match(/^snap/));
  if (!articleIdsWithoutSnaps.length) {
    return;
  }
  dispatch(externalArticleActions.fetchStart(articleIdsWithoutSnaps));
  try {
    const articles = await getArticlesBatched(articleIdsWithoutSnaps);
    dispatch(externalArticleActions.fetchSuccess(articles));
    const remainingArticles = difference(
      articleIdsWithoutSnaps,
      articles.map(_ => _.id)
    );
    if (remainingArticles.length) {
      dispatch(
        externalArticleActions.fetchError(
          `The following article ids were in a CAPI query but were not returned by CAPI: ${remainingArticles.join(
            ', '
          )}`,
          remainingArticles
        )
      );
    }
  } catch (e) {
    dispatch(externalArticleActions.fetchError(e.message, articleIds));
  }
};

const getCollectionsAndArticles = (
  collectionIds: string[],
  getCollectionAction = getCollection
): ThunkResult<Promise<void[]>> => (dispatch: Dispatch) =>
  Promise.all(
    collectionIds.map(async collectionId => {
      // @todo - requires correct handling of Dispatch thunks
      const articleIds = await dispatch(getCollectionAction(collectionId));
      await dispatch(fetchArticles(articleIds));
    })
  );

async function getVisibleArticles(collection: Collection, state: State, stage: Stages): Promise<VisibleArticlesResponse> {
  const collectionType = collection.type;
  const groups = getGroupsByStage(collection, stage);
  const groupArticleSelector = createGroupArticlesSelector();
  const groupsWithArticles = groups.map(id => groupArticleSelector(state, { groupId: id }));
  const articleDetails = await getVisibilityArticleDetails(groupsWithArticles);

  return fetchVisibleArticles(collectionType, articleDetails);
}


export { getCollection, getCollectionsAndArticles, fetchArticles, updateCollection };
