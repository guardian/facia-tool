import { fetchStaleOpenCollections } from 'actions/Collections';
import { Dispatch } from 'types/Store';
import { Store } from 'types/Store';
import { matchPath } from 'react-router';
import { frontsEdit } from 'constants/routes';
import { getV2SubPath } from 'selectors/pathSelectors';

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
    const match = matchPath<{ priority: string }>(
      getV2SubPath(store.getState()),
      {
        path: frontsEdit
      }
    );
    if (!match || !match.params.priority) {
      return;
    }
    (store.dispatch as Dispatch)(
      fetchStaleOpenCollections(match.params.priority)
    );
  }, 10000);
