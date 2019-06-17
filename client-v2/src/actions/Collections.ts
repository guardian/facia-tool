import { batchActions } from 'redux-batched-actions';
import {
  getArticlesBatched,
  updateCollection as updateCollectionFromApi,
  discardDraftChangesToCollection as discardDraftChangesToCollectionApi,
  fetchVisibleArticles,
  fetchLastPressed as fetchLastPressedApi,
  publishCollection as publishCollectionApi,
  getCollection as getCollectionApi
} from 'services/faciaApi';
import { VisibleArticlesResponse, CollectionResponse } from 'types/FaciaApi';
import {
  selectUserEmail,
  selectFirstName,
  selectLastName
} from 'selectors/configSelectors';
import {
  createGroupArticlesSelector,
  selectSharedState,
  createAllArticlesInCollectionSelector
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
import {
  articleFragmentsReceived,
  clearArticleFragments
} from 'shared/actions/ArticleFragments';
import { groupsReceived } from 'shared/actions/Groups';
import {
  recordVisibleArticles,
  publishCollectionSuccess,
  recordStaleFronts,
  fetchLastPressedSuccess
} from 'actions/Fronts';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import { getCollectionConfig, getFront } from 'selectors/frontsSelectors';
import { Dispatch, ThunkResult } from 'types/Store';
import { Action } from 'types/Action';
import {
  collectionItemSets,
  noOfOpenCollectionsOnFirstLoad
} from 'constants/fronts';
import {
  Stages,
  Collection,
  CollectionItemSets
} from 'shared/types/Collection';
import difference from 'lodash/difference';
import { selectArticlesInCollections } from 'shared/selectors/collection';
import {
  editorOpenCollections,
  editorCloseCollections
} from 'bundles/frontsUIBundle';
import flatten from 'lodash/flatten';
import { createCollectionsInOpenFrontsSelector } from 'selectors/collectionSelectors';
import uniq from 'lodash/uniq';
import { recordUnpublishedChanges } from 'actions/UnpublishedChanges';
import { isFrontStale } from 'util/frontsUtils';
import { visibleArticlesSelector } from 'selectors/frontsSelectors';
import { frontStages } from 'constants/fronts';
import { State } from 'types/State';
import { events } from 'services/GA';
import { collectionParamsSelector } from 'selectors/collectionSelectors';

const articlesInCollection = createAllArticlesInCollectionSelector();
const collectionsInOpenFrontsSelector = createCollectionsInOpenFrontsSelector();

function fetchStaleOpenCollections(
  priority: string
): ThunkResult<Promise<void>> {
  return async (dispatch: Dispatch, getState: () => State) => {
    const collectionIds = collectionsInOpenFrontsSelector(getState(), priority);
    const prevState = getState();
    const fetchedCollectionIds = await dispatch(
      getCollections(collectionIds, true)
    );
    const prevArticleIds = articlesInCollection(
      selectSharedState(prevState),
      fetchedCollectionIds
    );

    dispatch(
      getArticlesForCollections(
        fetchedCollectionIds,
        // get article for *all* collecitonItemSets as it reduces complexity of
        // this code (finding which collectionItemSets we need), and the overlap
        // should be pretty large between all of the sets
        Object.values(collectionItemSets)
      )
    );

    dispatch(clearArticleFragments(prevArticleIds));
  };
}

// These are collections which exist in the config but have never had any content
// added to them so they will not have their own collection file. They may be newly
// created collections or fully automated collections.
function getCollectionActionForMissingCollection(
  id: string,
  getState: () => State
): Action[] {
  const collectionConfig = getCollectionConfig(getState(), id);
  const collection = combineCollectionWithConfig(collectionConfig, {
    draft: [],
    live: [],
    previously: [],
    id,
    displayName: collectionConfig.displayName
  });
  const {
    normalisedCollection,
    groups
  } = normaliseCollectionWithNestedArticles(collection, collectionConfig);
  return [
    collectionActions.fetchSuccess(normalisedCollection),
    groupsReceived(groups)
  ];
}

function getCollectionActions(
  collectionResponse: CollectionResponse,
  getState: () => State
) {
  const {
    id,
    collection: collectionWithoutId,
    storiesVisibleByStage
  } = collectionResponse;
  const collectionConfig = getCollectionConfig(getState(), id);
  const collection = {
    ...collectionWithoutId,
    id
  };
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
}

function getCollections(
  collectionIds: string[],
  returnOnlyUpdatedCollections: boolean = false
): ThunkResult<Promise<string[]>> {
  return async (
    dispatch: Dispatch,
    getState: () => State,
    { fetchCollections }
  ) => {
    dispatch(collectionActions.fetchStart(collectionIds));
    try {
      const collectionResponses = await fetchCollections(
        getState(),
        collectionIds
      );

      if (!collectionResponses) {
        dispatch(
          collectionActions.fetchError(
            'cannot fetch collections for this route'
          )
        );
        return Promise.resolve([]);
      }

      // TODO: test that this works!
      // find all collections missing in the response and ensure their 'fetch'
      // status is reset
      const missingCollections = difference(
        collectionResponses.map(cr => cr.id),
        collectionIds
      );
      const missingActions = missingCollections.map(id =>
        collectionActions.fetchSuccessIgnore({
          id
        })
      );

      let missingCollectionActions: Action[][];
      if (!returnOnlyUpdatedCollections) {
        const missingCollectionIds = collectionIds.filter(
          id => !collectionResponses.some(response => response.id === id)
        );
        missingCollectionActions = missingCollectionIds.map(id =>
          getCollectionActionForMissingCollection(id, getState)
        );
      } else {
        missingCollectionActions = [];
      }
      const actions = collectionResponses.map(collectionResponse =>
        getCollectionActions(collectionResponse, getState)
      );

      dispatch(
        batchActions(
          flatten([...actions, ...missingActions, ...missingCollectionActions])
        )
      );
      return collectionResponses.map(({ id }) => id);
    } catch (error) {
      dispatch(collectionActions.fetchError(error, collectionIds));
      return [];
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
      dispatch(collectionActions.updateSuccess(collection.id));
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
  const articleIdsWithoutSnaps = uniq(
    articleIds.filter(id => !id.match(/^snap/))
  );
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
  itemSetCandidate: CollectionItemSets | CollectionItemSets[]
): ThunkResult<Promise<void>> => async (dispatch, getState) => {
  const itemSets = Array.isArray(itemSetCandidate)
    ? itemSetCandidate
    : [itemSetCandidate];
  const articleIds = itemSets.reduce(
    (acc, itemSet) => [
      ...acc,
      ...selectArticlesInCollections(selectSharedState(getState()), {
        collectionIds,
        itemSet
      })
    ],
    [] as string[]
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

/**
 * Initialise the collections in a front --
 * - Fetch all of its collections from the server
 * - Mark as open number of collections indicated by the constant, and fetch their articles
 */
function initialiseCollectionsForFront(
  frontId: string,
  browsingStage: CollectionItemSets
): ThunkResult<Promise<void>> {
  return async (dispatch: Dispatch, getState: () => State) => {
    const front = getFront(getState(), { frontId });
    if (!front) {
      return;
    }
    const collectionsWithArticlesToLoad = front.collections.slice(
      0,
      noOfOpenCollectionsOnFirstLoad
    );
    dispatch(editorOpenCollections(collectionsWithArticlesToLoad));
    await dispatch(getCollections(front.collections));
    await dispatch(
      getArticlesForCollections(collectionsWithArticlesToLoad, browsingStage)
    );
  };
}

function publishCollection(
  collectionId: string,
  frontId: string
): ThunkResult<Promise<void>> {
  events.collectionPublished(frontId, collectionId);

  return (dispatch: Dispatch, getState: () => State) => {
    const draftVisibleArticles = visibleArticlesSelector(getState(), {
      collectionId,
      stage: frontStages.draft
    });

    return publishCollectionApi(collectionId)
      .then(() => {
        dispatch(
          batchActions([
            publishCollectionSuccess(collectionId),
            recordUnpublishedChanges(collectionId, false),
            recordVisibleArticles(
              collectionId,
              draftVisibleArticles,
              frontStages.live
            )
          ])
        );

        dispatch(getCollections([collectionId]));

        return new Promise(resolve => setTimeout(resolve, 10000))
          .then(() => {
            const [params] = collectionParamsSelector(getState(), [
              collectionId
            ]);
            return Promise.all([
              getCollectionApi(params),
              fetchLastPressedApi(frontId)
            ]);
          })
          .then(([collectionResponse, lastPressed]) => {
            const lastPressedInMilliseconds = new Date(lastPressed).getTime();
            dispatch(
              batchActions([
                recordStaleFronts(
                  frontId,
                  isFrontStale(
                    collectionResponse.collection.lastUpdated,
                    lastPressedInMilliseconds
                  )
                ),
                fetchLastPressedSuccess(frontId, lastPressed)
              ])
            );
          });
      })
      .catch(() => {
        // @todo: implement once error handling is done
      });
  };
}

function discardDraftChangesToCollection(
  collectionId: string
): ThunkResult<Promise<void>> {
  return (dispatch: Dispatch, getState: () => State) => {
    return discardDraftChangesToCollectionApi(collectionId).then(
      collectionJson => {
        dispatch(batchActions(getCollectionActions(collectionJson, getState)));
      }
    );
  };
}

export {
  getCollections,
  getArticlesForCollections,
  openCollectionsAndFetchTheirArticles,
  closeCollections,
  fetchStaleOpenCollections,
  fetchArticles,
  updateCollection,
  initialiseCollectionsForFront,
  publishCollection,
  discardDraftChangesToCollection
};
