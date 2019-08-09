import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import { selectPriority } from 'selectors/pathSelectors';
import { matchFrontsEditPath, matchIssuePath } from 'routes/routes';
import { selectV2SubPath } from 'selectors/pathSelectors';
import { selectAllCollectionWithArticles } from '../redux/modules/pageViewData/selectors';
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

    const openFrontIds = store.getState().editor.frontIdsByPriority.editorial;
    const openFrontIdsWithCollections = openFrontIds.map(frontId => {
      return {
        frontId,
        collections: store.getState().fronts.frontsConfig.data.fronts[frontId]
          .collections
      };
    });

    const getOpenCollectionsForFront = (
      allCollectionsInAFront: string[]
    ): string[] => {
      return allCollectionsInAFront.filter(collection =>
        store.getState().editor.collectionIds.includes(collection)
      );
    };

    return openFrontIdsWithCollections.map(frontWithItsCollections => {
      const collectionsWithoutArticles = getOpenCollectionsForFront(
        frontWithItsCollections.collections
      );

      const collectionsWithArticles = selectAllCollectionWithArticles(
        store,
        collectionsWithoutArticles
      );

      if (collectionsWithArticles) {
        collectionsWithArticles.forEach(collection => {
          (store.dispatch as Dispatch)(
            getPageViewData(
              frontWithItsCollections.frontId,
              collection.articles,
              collection.id
            )
          );
        });
      }
    });
  }, 10000);
