import { reducer } from '../reducer';
import {
  updateEntries,
  removeEntries,
  setConnectionStatus
} from 'presence/actions';
import {
  selectCurrentPresenceClients,
  selectPresenceIsConnected,
  selectEntryMapKeys
} from 'presence/selectors';
import { createEntry } from './helpers/createEntry';

const init = () => reducer(undefined, { type: '@@INIT' } as any);

describe('presence reducer / selectors / actions', () => {
  it('adds subscribed entries', () => {
    const initState = init();
    const entry = createEntry();
    const newState = reducer(initState, updateEntries('a', [entry]));
    expect(selectCurrentPresenceClients(newState, 'a')).toEqual([
      entry.clientId
    ]);
  });

  it('removes subscribed entries', () => {
    const initState = init();
    const entry = createEntry();
    const tmpState = reducer(initState, updateEntries('a', [entry]));
    const newState = reducer(tmpState, removeEntries('a'));
    expect(selectCurrentPresenceClients(newState, 'a')).toEqual([]);
  });

  it('sets connection status', () => {
    const initState = init();
    const newState = reducer(initState, setConnectionStatus(true));
    expect(selectPresenceIsConnected(newState)).toBe(true);
    const newState2 = reducer(initState, setConnectionStatus(false));
    expect(selectPresenceIsConnected(newState2)).toBe(false);
  });

  it('selects all currently suscribed keys', () => {
    const initState = init();
    const entry = createEntry();
    const newState = reducer(initState, updateEntries('a', [entry]));
    expect(selectEntryMapKeys(newState)).toEqual(['a']);
  });
});
