export interface UserSpec {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PresenceOptions {
  user: UserSpec;
  presenceDomain: string;
}

export type PresenceClient = (
  options: PresenceOptions
) => {
  startConnection: () => void;
  subscribe: (keys: string[]) => void;
  enter: (key: string, place?: string) => void;
  addListener(name: 'connectionLog', handler: (e: any) => void): void;
  addListener(name: 'connected', handler: (e: any) => void): void;
  addListener(name: 'disconnected', handler: (e: any) => void): void;
  addListener(name: 'updated', handler: (e: UpdateResponse) => void): void;
  emit(name: 'connect'): void;
  once: () => void;
};

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
  clientId: Client;
  lastAction: string; // date
  location: string;
}

export interface Client {
  connId: string;
  person: Person;
}

export interface PresenceState {
  isConnected: boolean;
  entryMap: { [key: string]: Entry[] };
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

export interface SetConnectionStatusAction {
  type: 'PRESENCE/SET_CONNECTION_STATUS';
  payload: {
    isConnected: boolean;
  };
}

export type PresenceAction =
  | UpdateEntriesAction
  | RemoveEntriesAction
  | SetConnectionStatusAction;
