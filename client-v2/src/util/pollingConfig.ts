import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import { frontsEditPath } from 'components/App';
import { matchPath } from 'react-router';

/**
 * TODO: do we want to check if there are any collectionUpdates going out here
 * could there be a race condition where we try to update a collection and poll
 * at the same time and the poll overwrites the update
 */
export default (store: Store) =>
  setInterval(() => {
    const match = matchPath<{ priority: string }>(frontsEditPath, {
      path: store.getState().path
    });
    if (!match || !match.params.priority) {
      return;
    }
    (store.dispatch as Dispatch)(
      fetchStaleOpenCollections((match.params as { priority: string }).priority)
    );
  }, 10000);
