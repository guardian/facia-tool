export interface UserSpec {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateResponse {
  subscriptionId: string;
  currentState: Entry[];
}

export interface Person {
  browserId: string;
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
}

export interface Entry {
  clientId: {
    connId: string;
    person: Person;
  };
  lastAction: string; // date
  location: string;
}

export interface PresenceState {
  [key: string]: Entry[];
}

interface PresenceEnterMeta {
  type: 'ENTER';
  id: string;
}

interface PresenceExitMeta {
  type: 'EXIT';
  id: string;
}

export type PresenceActionMeta = PresenceEnterMeta | PresenceExitMeta;

export interface UpdateEntriesAction {
  type: 'PRESENCE/UPDATE_ENTRIES';
  payload: {
    articleFragmentId: string;
    entries: Entry[];
  };
}

export interface RemoveEntriesAction {
  type: 'PRESENCE/REMOVE_ENTRIES';
  payload: {
    articleFragmentId: string;
  };
}

export type PresenceAction = UpdateEntriesAction | RemoveEntriesAction;
