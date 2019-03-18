import { init } from './client';
import { Dispatch, Middleware, AnyAction } from 'redux';
import { PresenceActionMeta, UserSpec, PresenceState } from './types';
import { updateEntries, removeEntries, setConnectionStatus } from './actions';
import { BATCH } from 'redux-batched-actions';
import { selectEntryMapKeys } from './selectors';

const getPresenceMeta = (action: any): PresenceActionMeta | null =>
  (action.meta && action.meta.presence) || false;

const unwrapBatchedActions = (action: AnyAction): AnyAction[] =>
  action.type === BATCH ? (action.payload as AnyAction[]) : [action];

type PresenceMiddlewareArgs<S> = {
  selectPresenceState: (state: S) => PresenceState;
  presenceDomain: string;
  user: UserSpec;
  storagePrefix: string;
};

const middleware = <S, D extends Dispatch>({
  selectPresenceState,
  presenceDomain,
  user,
  storagePrefix
}: PresenceMiddlewareArgs<S>): Middleware<{}, S, D> => {
  return store => {
    // run init in here so that we don't have to wait for presence to boot the app
    // any presence actions won't actually do anything (but hopefully it will have loaded by then)
    let exitArticle = (key: string, keys: string[]) => {};
    let enterArticle = (key: string, keys: string[]) => {};

    const getState = () => selectPresenceState(store.getState());

    init(presenceDomain, user, storagePrefix, {
      onUpdated: (id, entries) => store.dispatch(updateEntries(id, entries)),
      onConnected: () => {
        store.dispatch(setConnectionStatus(true));
        return selectEntryMapKeys(getState());
      },
      onDisconnected: () => store.dispatch(setConnectionStatus(false))
    }).then(api => {
      exitArticle = api.exitArticle;
      enterArticle = api.enterArticle;
    });

    return next => action => {
      const actions = unwrapBatchedActions(action);

      actions.forEach(action => {
        const presenceMeta = getPresenceMeta(action);
        if (!presenceMeta) {
          return;
        }
        switch (presenceMeta.type) {
          case 'ENTER': {
            enterArticle(presenceMeta.id, selectEntryMapKeys(getState()));
            break;
          }
          case 'EXIT': {
            exitArticle(presenceMeta.id, selectEntryMapKeys(getState()));
            store.dispatch(removeEntries(presenceMeta.id));
            break;
          }
        }
      });

      return next(action);
    };
  };
};

export { middleware };
