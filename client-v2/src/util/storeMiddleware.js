// @flow

import { type Middleware } from 'redux';
import { uniq } from 'lodash';
import { type State } from 'types/State';
import { type Action, type ActionWithBatchedActions } from 'types/Action';
import { selectors } from 'shared/bundles/collectionsBundle';
import { updateCollection } from 'actions/Collections';
import { selectSharedState } from 'shared/selectors/shared';
import { type ThunkAction } from 'types/Store';
import { type Collection } from 'shared/types/Collection';

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
      path: window.location.pathname
    });

    dispatch({
      type: 'CLEAR_ERROR',
      receivedAt: Date.now()
    });
  }

  return result;
};

type PersistCollectionMeta = {|
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
|};

/**
 * Return an array of actions - either a single action,
 * or multiple actions if the action contains batched actions.
 */
const unwrapBatchedActions = (action: ActionWithBatchedActions): Action[] =>
  action.type === 'BATCHING_REDUCER.BATCH' ? action.payload : [action];

/**
 * Watches for actions that require a collection update, finds the relevant
 * collection, and dispatches the appropriate action.
 *
 * There's quite a lot of code here that's specific to redux-batched-actions,
 * which would be nice to remove in favour of a more declarative library if
 * possible.
 */
const persistCollectionOnEdit: (
  (collection: Collection) => Action | ThunkAction
) => Middleware<Store, Action> = (
  updateCollectionAction: (
    collection: Collection
  ) => Action | ThunkAction = updateCollection
) => store => {
  /**
   * Get the relevant collection ids for the given actions.
   * @todo At the moment this just cares about updates to article fragments,
   *   but it should also listen for edits to collections.
   */
  const getCollectionIdsForActions = (actions: Action[]) => {
    const articleFragmentIds: string[] = uniq(
      actions.map(
        // A sneaky 'any' here, as it's difficult to handle dynamic key
        // values with static action types.
        (act: any) =>
          act.payload && act.meta.persistTo && act.meta.key
            ? act.payload[act.meta.key]
            : act.payload.id
      )
    );
    const collectionIds: string[] = articleFragmentIds.reduce((acc, id) => {
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

  return next => (action: Action) => {
    const actions = unwrapBatchedActions(action);

    if (!actions.some(act => act.meta && act.meta.persistTo === 'collection')) {
      return next(action);
    }

    // Gather the collections that are touched before the new state.
    let collectionIds = getCollectionIdsForActions(
      actions.filter(act => act.meta && act.meta.applyBeforeReducer)
    );

    const result = next(action);

    // Gather the collections that are touched in the new state.
    collectionIds = uniq(
      collectionIds.concat(
        getCollectionIdsForActions(
          actions.filter(act => !act.meta || !act.meta.applyBeforeReducer)
        )
      )
    );

    // Persist the lot!
    const sharedState = selectSharedState(store.getState());
    collectionIds.forEach(id => {
      const collection = selectors.selectById(sharedState, id);
      // Flow has problems with us dispatching thunks here.
      // This relates to a problem with the middleware definition -
      // see https://github.com/flowtype/flow-typed/issues/574
      // $FlowFixMe
      store.dispatch(updateCollectionAction(collection));
    });

    return result;
  };
};

export type { PersistCollectionMeta };
export { persistCollectionOnEdit, updateStateFromUrlChange };
