import { Middleware } from 'redux';
import uniq from 'lodash/uniq';
import mapValues from 'lodash/mapValues';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { BATCH } from 'redux-batched-actions';
import { Action, ActionPersistMeta } from 'types/Action';
import { selectors } from 'shared/bundles/collectionsBundle';
import { updateCollection } from 'actions/Collections';
import { updateClipboard } from 'actions/Clipboard';
import { selectSharedState } from 'shared/selectors/shared';
import { saveOpenFrontIds, saveFavouriteFrontIds } from 'services/userDataApi';
import { NestedCard } from 'shared/types/Collection';
import { denormaliseClipboard } from 'util/clipboardUtils';
import { selectFront } from 'selectors/frontsSelectors';
import {
  selectEditorFrontIds,
  selectEditorFavouriteFrontIds
} from 'bundles/frontsUIBundle';
import debounce from 'lodash/debounce';

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

type PersistTo =
  | 'collection'
  | 'clipboard'
  | 'openFrontIds'
  | 'favouriteFrontIds';

type Entity = 'collection';

interface PersistMeta {
  // The resource to persist the data to
  persistTo: PersistTo;
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
  // Entity to which the Action id refers to
  entity?: Entity;
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
  updateCollectionAction = updateCollection,
  debounceTime = 500
): Middleware<{}, State, Dispatch> => store => {
  let pendingCollectionIds = [] as string[];
  const throttledPersistCollectionEdits = debounce(
    () => {
      const sharedState = selectSharedState(store.getState());
      pendingCollectionIds.forEach(id => {
        const collection = selectors.selectById(sharedState, id);
        if (collection) {
          store.dispatch(updateCollectionAction(collection));
        }
      });
      pendingCollectionIds = [];
    },
    debounceTime,
    { trailing: true }
  );

  const persistCollectionEdits = (ids: string[]) => {
    ids.forEach(id => {
      if (!pendingCollectionIds.includes(id)) {
        pendingCollectionIds.push(id);
      }
    });
    throttledPersistCollectionEdits();
  };
  /**
   * Get the relevant collection ids for the given actions.
   * @todo At the moment this just cares about updates to cards,
   *   but it should also listen for edits to collections.
   */
  const getCollectionIdsForActions = (actions: Action[]) => {
    const idsAndEntities: Array<{ id: string; entity: Entity }> = actions.map(
      // A sneaky 'any' here, as it's difficult to handle dynamic key
      // values with static action types.
      (act: any) => {
        const id =
          act.meta.id ||
          (act.meta.key ? act.payload[act.meta.key] : act.payload.id);
        return {
          id,
          entity: act.meta.entity
        };
      }
    );
    const collectionIds: string[] = idsAndEntities.reduce(
      (acc, { id, entity }) => {
        if (entity === 'collection') {
          return acc.concat(id);
        }

        const collectionId = selectors.selectParentCollectionOfCard(
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
    return uniq(collectionIds);
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

    persistCollectionEdits(collectionIds);

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
    articles: NestedCard[];
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
    frontIds.filter(frontId => !!selectFront(state, { frontId }))
  );
  // Now they're in the state, persist the relevant front ids.
  persistFrontIds(filteredFrontIdsByPriority);
  return result;
};

const persistFavouriteFrontsOnEdit: (
  persistFn?: (
    persistFrontIds?: { [priority: string]: string[] }
  ) => Promise<void>
) => Middleware<{}, State, Dispatch> = (
  persistFrontIds = saveFavouriteFrontIds
) => store => next => (action: Action) => {
  const actions = unwrapBatchedActions(action);

  if (
    !actions.some(
      act =>
        (act as Action & ActionPersistMeta).meta &&
        (act as Action & ActionPersistMeta).meta.persistTo ===
          'favouriteFrontIds'
    )
  ) {
    return next(action);
  }
  const result = next(action);
  const state = store.getState();
  const favouriteFrontIdsByPriority = selectEditorFavouriteFrontIds(state);

  persistFrontIds(favouriteFrontIdsByPriority);
  return result;
};

export {
  PersistMeta,
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit,
  persistFavouriteFrontsOnEdit,
  updateStateFromUrlChange
};
