// @flow

import { type Middleware } from 'redux';
import uniq from 'lodash/uniq';
import { type State } from 'types/State';
import { type Action, type ActionWithBatchedActions } from 'types/Action';
import { selectors } from 'shared/bundles/collectionsBundle';
import { selectEditorFronts } from 'bundles/frontsUIBundle';
import { updateCollection } from 'actions/Collections';
import { updateClipboard } from 'actions/Clipboard';
import { selectSharedState } from 'shared/selectors/shared';
import { type ThunkAction } from 'types/Store';
import { saveOpenFrontIds } from 'services/faciaApi';
import type {
  Collection,
  NestedArticleFragment
} from 'shared/types/Collection';
import { denormaliseClipboard } from 'util/clipboardUtils';

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

type PersistMeta = {|
  // The resource to persist the data to
  persistTo: 'collection' | 'clipboard',
  // The key to take from the action payload. Defaults to 'id'.
  key?: string,
  // Should we find collection parents before or after the reducer is called?
  // This is important when the relevant collection is affected by when the operation
  // occurs - finding the parent collection before a remove operation, for example,
  // or after an add operation.
  applyBeforeReducer?: boolean
|};

function addPersistMetaToAction<TArgs: Array<any>, TAction: Object>(
  actionCreator: (...args: TArgs) => TAction,
  meta: PersistMeta
): (...args: TArgs) => TAction & {| meta: PersistMeta |} {
  return (...args: TArgs): TAction & {| meta: PersistMeta |} => ({
    ...actionCreator(...args),
    meta
  });
}

/**
 * Return an array of actions - either a single action,
 * or multiple actions if the action contains batched actions.
 */
const unwrapBatchedActions = (action: ActionWithBatchedActions): Action[] =>
  action.type === 'BATCHING_REDUCER.BATCH' ? action.payload : [action];

const isPersistingToCollection = (act: Action): boolean =>
  !!act.meta && act.meta.persistTo === 'collection';

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
  const getCollectionIdsForActions = actions => {
    const articleFragmentIds: string[] = uniq(
      actions.map(
        // A sneaky 'any' here, as it's difficult to handle dynamic key
        // values with static action types.
        (act: any) =>
          act.meta.key ? act.payload[act.meta.key] : act.payload.id
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

    if (!actions.some(isPersistingToCollection)) {
      return next(action);
    }

    // Gather the collections that are touched before the new state.
    let collectionIds = getCollectionIdsForActions(
      actions.filter(
        act =>
          isPersistingToCollection(act) &&
          act.meta &&
          act.meta.applyBeforeReducer
      )
    );

    const result = next(action);

    // Gather the collections that are touched in the new state.
    collectionIds = uniq(
      collectionIds.concat(
        getCollectionIdsForActions(
          actions.filter(
            act =>
              isPersistingToCollection(act) &&
              act.meta &&
              !act.meta.applyBeforeReducer
          )
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

const persistClipboardOnEdit: (
  (clipboard: { articles: Array<NestedArticleFragment> }) =>
    | Action
    | ThunkAction
) => Middleware<Store, Action> = (
  updateClipboardAction: (clipboard: {
    articles: Array<NestedArticleFragment>
  }) => Action | ThunkAction = updateClipboard
) => store => next => (action: Action) => {
  const actions = unwrapBatchedActions(action);

  if (!actions.some(act => act.meta && act.meta.persistTo === 'clipboard')) {
    return next(action);
  }
  const result = next(action);
  const state = store.getState();
  const denormalisedClipboard: {
    articles: Array<NestedArticleFragment>
  } = denormaliseClipboard(state);
  // $FlowFixMe
  store.dispatch(updateClipboardAction(denormalisedClipboard));
  return result;
};

const persistOpenFrontsOnEdit: (
  persistFrontIds?: (string[]) => Promise<void>
) => Middleware<Store, Action> = (
  persistFrontIds = saveOpenFrontIds
) => store => next => (action: Action) => {
  const actions = unwrapBatchedActions(action);

  if (!actions.some(act => act.meta && act.meta.persistTo === 'openFrontIds')) {
    return next(action);
  }
  const result = next(action);
  const frontIds = selectEditorFronts(store.getState());
  // Now they're in the state, persist the relevant front ids.
  persistFrontIds(frontIds);
  return result;
};

export type { PersistMeta };
export {
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit,
  updateStateFromUrlChange,
  addPersistMetaToAction
};
