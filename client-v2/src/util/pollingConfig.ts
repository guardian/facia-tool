import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import { matchPath } from 'react-router';
import { frontsEdit, base } from 'constants/routes';

/**
 * TODO: do we want to check if there are any collectionUpdates going out here
 * could there be a race condition where we try to update a collection and poll
 * at the same time and the poll overwrites the update
 */
export default (store: Store) =>
  setInterval(() => {
    const path = `${base}${frontsEdit}`;
    const match = matchPath<{ priority: string }>(store.getState().path, {
      path
    });
    if (!match || !match.params.priority) {
      return;
    }
    (store.dispatch as Dispatch)(
      fetchStaleOpenCollections((match.params as { priority: string }).priority)
    );
  }, 10000);
