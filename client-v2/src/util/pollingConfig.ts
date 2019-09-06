import { fetchStaleCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import {
  collectionsPollInterval,
  ophanPollInterval,
  articlesPollInterval
} from 'constants/polling';
import { selectPriority } from 'selectors/pathSelectors';
import { getPageViewData } from '../redux/modules/pageViewData/actions';
import { selectFeatureValue } from 'shared/redux/modules/featureSwitches/selectors';
import { selectSharedState } from 'shared/selectors/shared';
import {
  selectOpenFrontsCollectionsAndArticles,
  selectOpenArticles
} from 'bundles/frontsUIBundle';
import { getArticlesBatched } from 'services/faciaApi';
import { createSelectCollectionsInOpenFronts } from 'selectors/collectionSelectors';

/**
 * TODO: do we want to check if there are any collectionUpdates going out here
 * could there be a race condition where we try to update a collection and poll
 * at the same time and the poll overwrites the update
 */
export default (store: Store) => {
  if ((window as any).IS_INTEGRATION) {
    return;
  }

  setInterval(refreshStaleCollections(store), collectionsPollInterval);
  setInterval(refreshOpenArticles(store), articlesPollInterval);

  const shouldPollOphan = selectFeatureValue(
    selectSharedState(store.getState()),
    'page-view-data-visualisation'
  );

  if (shouldPollOphan) {
    setInterval(refreshOphanData, ophanPollInterval);
  }
};

const selectCollectionsInOpenFronts = createSelectCollectionsInOpenFronts();

const refreshStaleCollections = (store: Store) => {
  const state = store.getState();
  const priority = selectPriority(state);
  if (!priority) {
    return;
  }

  const collectionIds = selectCollectionsInOpenFronts(state);
  (store.dispatch as Dispatch)(fetchStaleCollections(collectionIds));
};

const refreshOpenArticles = (store: Store) => {
  const state = store.getState();
  const openArticles = selectOpenArticles(state);
  getArticlesBatched(openArticles.map(_ => _.id));
};

const refreshOphanData = (store: Store) => {
  const state = store.getState();
  const openFrontsCollectionAndArticles = selectOpenFrontsCollectionsAndArticles(
    state
  );
  openFrontsCollectionAndArticles.forEach(front => {
    front.collections.forEach(collection => {
      if (collection.articles.length > 0) {
        (store.dispatch as Dispatch)(
          getPageViewData(front.frontId, collection.articles, collection.id)
        );
      }
    });
  });
};
