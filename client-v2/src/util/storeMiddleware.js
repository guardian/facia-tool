// @flow

import { type Middleware } from 'redux';
import { uniq } from 'lodash';
import { type State } from 'types/State';
import { type Action } from 'types/Action';
import { selectors } from 'shared/bundles/collectionsBundle';
import { updateCollection } from 'actions/Collections';
import { selectSharedState } from 'shared/selectors/shared';

const updateStateFromUrlChange: Middleware<State, Action> = ({
  dispatch,
  getState
}) => next => action => {
  const prevState = getState();
  const result = next(action);
  getState();

  if (prevState.path !== window.location.pathname) {
    dispatch({
      type: 'PATH_UPDATE',
      path: window.location.pathname,
      receivedAt: Date.now()
    });

    dispatch({
      type: 'CLEAR_ERROR',
      receivedAt: Date.now()
    });
  }

  return result;
};

type PersistCollectionMeta = {
  meta: {
    // The resource to persist the data to
    persistTo: 'collection',
    // The key to take from the action payload. Defaults to 'id'.
    key?: string,
    // Should we find collection parents before or after the reducer is called?
    // This is important when the relevant collection is affected by when the operation
    // occurs - finding the parent collection before a remove operation, for example,
    // or after an add operation.
    applyBeforeReducer?: boolean
  }
};

/**
 * Return an array of actions - either a single action,
 * or multiple actions if the action contains batched actions.
 */
const unwrapBatchedActions = (action: Action): Action[] =>
  action.meta && action.meta.batch ? action.payload : [action];

/**
 * Watches for actions that require a collection update, finds the relevant
 * collection, and dispatches the appropriate action.
 */
const persistCollectionOnEdit: Middleware<State, Action> = store => {
  const getCollectionIdsForActions = (actions: Action[]) => {
    const articleFragmentIds: string[] = uniq(
      actions.map(
        act =>
          act.payload && act.meta.key
            ? act.payload[act.meta.key]
            : act.payload.id
      )
    );
    const collectionIds: string[] = articleFragmentIds.reduce((acc, id) => {
      // Find the relevant collection...
      const collectionId = selectors.selectParentCollectionOfArticleFragment(
        selectSharedState(store.getState()),
        id
      );
      if (!collectionId) {
        return acc;
      }
      return acc.concat(collectionId);
    }, []);
    return collectionIds;
  };

  return next => action => {
    const actions = unwrapBatchedActions(action);
    if (!actions.some(act => act.meta && act.meta.persistTo === 'collection')) {
      return next(action);
    }
    let collectionIds = getCollectionIdsForActions(
      actions.filter(act => act.meta.applyBeforeReducer)
    );

    const result = next(action);

    collectionIds = uniq(
      collectionIds.concat(
        getCollectionIdsForActions(
          actions.filter(act => !act.meta.applyBeforeReducer)
        )
      )
    );

    // ...and persist it!
    const sharedState = selectSharedState(store.getState());
    collectionIds.forEach(id => {
      const collection = selectors.selectById(sharedState, id);
      store.dispatch(updateCollection(collection));
    });

    return result;
  };
};

export type { PersistCollectionMeta };
export { persistCollectionOnEdit, updateStateFromUrlChange };
