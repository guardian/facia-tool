import { init } from './client';
import { Dispatch, Middleware, AnyAction } from 'redux';
import { PresenceActionMeta, UserSpec } from './types';
import { updateEntries, removeEntries } from './actions';
import { BATCH } from 'redux-batched-actions';

const getPresenceMeta = (action: any): PresenceActionMeta | null =>
  (action.meta && action.meta.presence) || false;

const unwrapBatchedActions = (action: AnyAction): AnyAction[] =>
  action.type === BATCH ? (action.payload as AnyAction[]) : [action];

const middleware = <S, D extends Dispatch>(
  presenceDomain: string,
  user: UserSpec,
  storagePrefix: string
): Middleware<{}, S, D> => {
  return store => {
    // run init in here so that we don't have to wait for presence to boot the app
    // any presence actions won't actually do anything (but hopefully it will have loaded by then)
    let exitArticle = (key: string) => {};
    let enterArticle = (key: string) => {};

    init(presenceDomain, user, storagePrefix, (id, entries) =>
      store.dispatch(updateEntries(id, entries))
    ).then(api => {
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
            enterArticle(presenceMeta.id);
            break;
          }
          case 'EXIT': {
            exitArticle(presenceMeta.id);
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
