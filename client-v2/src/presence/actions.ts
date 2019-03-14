import { AnyAction } from 'redux';
import {
  PresenceActionMeta,
  Entry,
  UpdateEntriesAction,
  RemoveEntriesAction
} from './types';

const addPresenceMetaToAction = (type: 'ENTER' | 'EXIT', id: string) => <
  T extends AnyAction
>(
  action: T
): T & { meta: { presence: PresenceActionMeta } } => ({
  ...action,
  meta: {
    presence:
      type === 'ENTER' // weird TS
        ? {
            type,
            id
          }
        : {
            type,
            id
          }
  }
});

const updateEntries = (id: string, entries: Entry[]): UpdateEntriesAction => ({
  type: 'PRESENCE/UPDATE_ENTRIES',
  payload: {
    articleFragmentId: id,
    entries
  }
});

const removeEntries = (id: string): RemoveEntriesAction => ({
  type: 'PRESENCE/REMOVE_ENTRIES',
  payload: {
    articleFragmentId: id
  }
});

export { addPresenceMetaToAction, updateEntries, removeEntries };
