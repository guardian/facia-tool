import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import { selectPriority } from 'selectors/pathSelectors';

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
  }, 10000);
