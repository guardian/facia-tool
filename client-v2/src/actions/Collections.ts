import { batchActions } from 'redux-batched-actions';
import {
  getArticlesBatched,
  getCollections as fetchCollection,
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
import { Dispatch, ThunkResult } from 'types/Store';
import { frontStages } from 'constants/fronts';
import {
  Stages,
  Collection,
  CollectionItemSets
} from 'shared/types/Collection';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';
import difference from 'lodash/difference';
import { selectArticlesInCollections } from 'shared/selectors/collection';
import {
  editorOpenCollections,
  editorCloseCollections
} from 'bundles/frontsUIBundle';
import flatten from 'lodash/flatten';

function getCollections(collectionIds: string[]): ThunkResult<Promise<void>> {
  return async (dispatch: Dispatch, getState: () => State) => {
    dispatch(collectionActions.fetchStart(collectionIds));
    try {
      const collectionResponses = await fetchCollection(collectionIds);
      const actions = collectionResponses.map((collectionResponse, index) => {
        const collectionId = collectionIds[index];
        const collectionConfig = getCollectionConfig(getState(), collectionId);
        if (!collectionResponse) {
          if (collectionId) {
            return collectionActions.fetchSuccess({
              id: collectionId,
              displayName: collectionConfig.description,
              type: collectionConfig.type
            });
          }
          return collectionActions.fetchError(
            `No collection returned in collections request for id ${
              collectionIds[index]
            }`,
            collectionIds[index]
          );
        }
        const { collection, storiesVisibleByStage } = collectionResponse;
        const collectionWithNestedArticles = combineCollectionWithConfig(
          collectionConfig,
          collection
        );
        const hasUnpublishedChanges =
          collectionWithNestedArticles.draft !== undefined;

        const collectionWithDraftArticles = {
          ...collectionWithNestedArticles,
          draft: populateDraftArticles(collectionWithNestedArticles)
        };
        const {
          normalisedCollection,
          articleFragments,
          groups
        } = normaliseCollectionWithNestedArticles(
          collectionWithDraftArticles,
          collectionConfig
        );

        return [
          collectionActions.fetchSuccess(normalisedCollection),
          articleFragmentsReceived(articleFragments),
          recordUnpublishedChanges(collection.id, hasUnpublishedChanges),
          groupsReceived(groups),
          recordVisibleArticles(
            collection.id,
            storiesVisibleByStage.live,
            frontStages.live
          ),
          recordVisibleArticles(
            collection.id,
            storiesVisibleByStage.draft,
            frontStages.draft
          )
        ];
      });
      dispatch(batchActions(flatten(actions)));
    } catch (error) {
      dispatch(collectionActions.fetchError(error, collectionIds));
    }
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
      const visibleArticles = await getVisibleArticles(
        collection,
        getState(),
        frontStages.draft
      );
      dispatch(
        recordVisibleArticles(collection.id, visibleArticles, frontStages.draft)
      );
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

const getArticlesForCollections = (
  collectionIds: string[],
  itemSet: CollectionItemSets
): ThunkResult<Promise<void>> => async (dispatch, getState) => {
  const articleIds = selectArticlesInCollections(
    selectSharedState(getState()),
    { collectionIds, itemSet }
  );
  await dispatch(fetchArticles(articleIds));
};

const openCollectionsAndFetchTheirArticles = (
  collectionIds: string[],
  itemSet: CollectionItemSets
): ThunkResult<Promise<void>> => async dispatch => {
  dispatch(editorOpenCollections(collectionIds));
  return dispatch(getArticlesForCollections(collectionIds, itemSet));
};

const closeCollections = (collectionIds: string[]): ThunkResult<void> => {
  return dispatch => {
    return dispatch(editorCloseCollections(collectionIds));
  };
};

function getVisibleArticles(
  collection: Collection,
  state: State,
  stage: Stages
): Promise<VisibleArticlesResponse> {
  const collectionType = collection.type;
  const groups = getGroupsByStage(collection, stage);
  const groupArticleSelector = createGroupArticlesSelector();
  const groupsWithArticles = groups.map(id =>
    groupArticleSelector(state, { groupId: id })
  );
  const articleDetails = getVisibilityArticleDetails(groupsWithArticles);

  return fetchVisibleArticles(collectionType, articleDetails);
}

export {
  getCollections,
  getArticlesForCollections,
  openCollectionsAndFetchTheirArticles,
  closeCollections,
  fetchArticles,
  updateCollection
};
