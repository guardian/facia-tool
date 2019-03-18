import { PresenceState } from './types';

const selectPresenceIsConnected = (state: PresenceState) => state.isConnected;

const selectCurrentPresenceClients = (state: PresenceState, id: string) =>
  (state.entryMap[id] || []).map(entry => entry.clientId);

const selectEntryMapKeys = (state: PresenceState) =>
  Object.keys(state.entryMap);

export {
  selectCurrentPresenceClients,
  selectPresenceIsConnected,
  selectEntryMapKeys
};
