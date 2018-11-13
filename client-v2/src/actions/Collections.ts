import uniq from 'lodash/uniq';
import { batchActions } from 'redux-batched-actions';
import {
  getArticlesBatched,
  getCollection as fetchCollection,
  updateCollection as updateCollectionFromApi,
  fetchVisibleStories
} from 'services/faciaApi';
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
  getVisibilityStoryDetails,
  getGroupsByStage
} from 'util/frontsUtils';
import {
  normaliseCollectionWithNestedArticles,
  denormaliseCollection
} from 'shared/util/shared';
import { articleFragmentsReceived } from 'shared/actions/ArticleFragments';
import { groupsReceived } from 'shared/actions/Groups';
import { recordVisibleStories } from 'actions/Fronts';
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

      //abstract logic out from get visible stories
      dispatch(getVisibleStories(collection, getState(), frontStages.live));
      dispatch(getVisibleStories(collection, getState(), frontStages.draft));

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
      dispatch(collectionActions.updateSuccess(collection.id, collection));
      dispatch(getVisibleStories(collection, getState(), frontStages.draft));
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

const getVisibleStories = (collection: Collection, state: State, stage: Stages): ThunkResult<Promise<void>> => async (dispatch: Dispatch) => {
  const collectionType = collection.type;
  const groups = getGroupsByStage(collection, stage);
  const groupArticleSelector = createGroupArticlesSelector();
  const groupsWithStories = groups.map(id => groupArticleSelector(state, { groupId: id }));

  const storyDetails = getVisibilityStoryDetails(groupsWithStories);

  try {
    const visible = await fetchVisibleStories(collectionType, storyDetails);
    await dispatch(recordVisibleStories(collection.id, visible, stage));
  } catch (error) {
    // TODO
  }
}


export { getCollection, getCollectionsAndArticles, fetchArticles, updateCollection };
