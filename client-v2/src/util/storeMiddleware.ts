import { Middleware } from 'redux';
import uniq from 'lodash/uniq';
import mapValues from 'lodash/mapValues';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { BATCH } from 'redux-batched-actions';
import { Action, ActionPersistMeta } from 'types/Action';
import { selectors } from 'shared/bundles/collectionsBundle';
import { selectEditorFrontIds } from 'bundles/frontsUIBundle';
import { updateCollection } from 'actions/Collections';
import { updateClipboard } from 'actions/Clipboard';
import { selectSharedState } from 'shared/selectors/shared';
import { saveOpenFrontIds } from 'services/faciaApi';
import { NestedArticleFragment } from 'shared/types/Collection';
import { denormaliseClipboard } from 'util/clipboardUtils';
import { getFront } from 'selectors/frontsSelectors';

const updateStateFromUrlChange: Middleware<{}, State, Dispatch> = ({
  dispatch,
  getState
}: {
  dispatch: Dispatch;
  getState: () => State;
}) => (next: (action: Action) => void) => (action: Action) => {
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

interface PersistMeta {
  // The resource to persist the data to
  persistTo: 'collection' | 'clipboard' | 'openFrontIds';
  // The id to to search for in this resource
  id?: string;
  // The key to take from the action payload if it is not specified. Defaults to
  // 'id'.
  key?: string;
  // Should we find collection parents before or after the reducer is called?
  // This is important when the relevant collection is affected by when the operation
  // occurs - finding the parent collection before a remove operation, for example,
  // or after an add operation.
  applyBeforeReducer?: boolean;
}

function addPersistMetaToAction<TArgs extends any[]>(
  actionCreator: (...args: TArgs) => Action,
  meta: PersistMeta
): (...args: TArgs) => Action & ActionPersistMeta {
  return (...args: TArgs): Action & ActionPersistMeta =>
    Object.assign({}, actionCreator(...args), { meta });
}

/**
 * Return an array of actions - either a single action,
 * or multiple actions if the action contains batched actions.
 */
const unwrapBatchedActions = (action: Action): Action[] =>
  action.type === BATCH ? (action.payload as Action[]) : [action];

const isPersistingToCollection = (act: Action): boolean =>
  !!(act as Action & ActionPersistMeta).meta &&
  (act as Action & ActionPersistMeta).meta.persistTo === 'collection';

/**
 * Watches for actions that require a collection update, finds the relevant
 * collection, and dispatches the appropriate action.
 *
 * There's quite a lot of code here that's specific to redux-batched-actions,
 * which would be nice to remove in favour of a more declarative library if
 * possible.
 */
const persistCollectionOnEdit = (
  updateCollectionAction = updateCollection
): Middleware<{}, State, Dispatch> => store => {
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
          act.meta.id ||
          (act.meta.key ? act.payload[act.meta.key] : act.payload.id)
      )
    );
    const collectionIds: string[] = articleFragmentIds.reduce(
      (acc, id) => {
        const collectionId = selectors.selectParentCollectionOfArticleFragment(
          selectSharedState(store.getState()),
          id
        );
        if (!collectionId) {
          return acc;
        }
        return acc.concat(collectionId);
      },
      [] as string[]
    );
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
          (act as Action & ActionPersistMeta).meta &&
          (act as Action & ActionPersistMeta).meta.applyBeforeReducer
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
              (act as Action & ActionPersistMeta).meta &&
              !(act as Action & ActionPersistMeta).meta.applyBeforeReducer
          )
        )
      )
    );

    // Persist the lot!
    const sharedState = selectSharedState(store.getState());
    collectionIds.forEach(id => {
      const collection = selectors.selectById(sharedState, id);
      if (collection) {
        store.dispatch(updateCollectionAction(collection));
      }
    });

    return result;
  };
};

const persistClipboardOnEdit = (
  updateClipboardAction = updateClipboard
): Middleware<{}, State, Dispatch> => store => next => (action: Action) => {
  const actions = unwrapBatchedActions(action);

  if (
    !actions.some(
      act =>
        (act as Action & ActionPersistMeta).meta &&
        (act as Action & ActionPersistMeta).meta.persistTo === 'clipboard'
    )
  ) {
    return next(action);
  }
  const result = next(action);
  const state = store.getState();
  const denormalisedClipboard: {
    articles: NestedArticleFragment[];
  } = denormaliseClipboard(state);
  store.dispatch(updateClipboardAction(denormalisedClipboard));
  return result;
};

const persistOpenFrontsOnEdit: (
  persistFn?: (
    persistFrontIds?: { [priority: string]: string[] }
  ) => Promise<void>
) => Middleware<{}, State, Dispatch> = (
  persistFrontIds = saveOpenFrontIds
) => store => next => (action: Action) => {
  const actions = unwrapBatchedActions(action);

  if (
    !actions.some(
      act =>
        (act as Action & ActionPersistMeta).meta &&
        (act as Action & ActionPersistMeta).meta.persistTo === 'openFrontIds'
    )
  ) {
    return next(action);
  }
  const result = next(action);
  const state = store.getState();
  const frontIdsByPriority = selectEditorFrontIds(state);

  // Only persist fronts that exist in the state, clearing out
  // fronts that have been deleted.
  const filteredFrontIdsByPriority = mapValues(frontIdsByPriority, frontIds =>
    frontIds.filter(frontId => !!getFront(state, frontId))
  );
  // Now they're in the state, persist the relevant front ids.
  persistFrontIds(filteredFrontIdsByPriority);
  return result;
};

export { PersistMeta };
export {
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit,
  updateStateFromUrlChange,
  addPersistMetaToAction
};
