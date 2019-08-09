import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import { selectPriority } from 'selectors/pathSelectors';
import { matchFrontsEditPath, matchIssuePath } from 'routes/routes';
import { selectV2SubPath } from 'selectors/pathSelectors';
import {
  selectCollectionsWithArticles,
  selectOpenCollectionsForFront
} from '../redux/modules/pageViewData/selectors';
import { getPageViewData } from '../redux/modules/pageViewData/actions';

/**
 * TODO: do we want to check if there are any collectionUpdates going out here
 * could there be a race condition where we try to update a collection and poll
 * at the same time and the poll overwrites the update
 */
export default (store: Store) =>
  setInterval(() => {
    if ((window as any).IS_INTEGRATION) {
      return;
    }

    const priority = selectPriority(store.getState());
    if (!priority) {
      return;
    }
    (store.dispatch as Dispatch)(fetchStaleOpenCollections(priority));

    const openFronts = store.getState().editor.frontIdsByPriority.editorial;
    const openFrontsWithCollections = openFronts.map(frontId => ({
      frontId,
      collections: store.getState().fronts.frontsConfig.data.fronts[frontId]
        .collections
    }));

    openFrontsWithCollections.map(front => {
      const openCollections = selectOpenCollectionsForFront(
        front.collections,
        store.getState().editor.collectionIds
      );

      const collectionsWithArticles = selectCollectionsWithArticles(
        store,
        openCollections
      );

      if (!collectionsWithArticles) {
        return;
      }

      collectionsWithArticles.forEach(collection => {
        (store.dispatch as Dispatch)(
          getPageViewData(front.frontId, collection.articles, collection.id)
        );
      });
    });
  }, 10000);
