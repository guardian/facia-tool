import { PresenceState } from './types';

const selectCurrentPresencePeople = (state: PresenceState, id: string) =>
  (state[id] || []).map(entry => entry.clientId.person);

export { selectCurrentPresencePeople };
