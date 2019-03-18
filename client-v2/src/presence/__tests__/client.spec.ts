import { init } from 'presence/client';
import { PresenceClient } from 'presence/types';
import { createEntry } from './helpers/createEntry';

const createMockPresence = () => {
  const subscriberMap = {} as {
    [key: string]: Array<(...args: any[]) => void>;
  };
  return {
    startConnection: jest.fn(),
    enter: jest.fn(),
    subscribe: jest.fn(),
    addListener: jest.fn((name: string, fn: () => void) => {
      subscriberMap[name] = subscriberMap[name] || [];
      subscriberMap[name].push(fn);
    }),
    once: jest.fn((name: string, fn: () => void) => {
      subscriberMap[name] = subscriberMap[name] || [];
      subscriberMap[name].push(fn);
    }),
    emit: jest.fn((name: string, ...args: any[]) => {
      (subscriberMap[name] || []).forEach(fn => fn(...args));
    })
  };
};

const build = () => {
  const mockPresence = createMockPresence();
  const mockPresenceClientBuilder = (): Promise<PresenceClient> =>
    Promise.resolve(() => mockPresence);
  const statusHandlers = {
    onUpdated: jest.fn(),
    onConnected: jest.fn(() => ['a']),
    onDisconnected: jest.fn()
  };
  const apiPromise = init(
    'presence-domain.com',
    {
      firstName: 'R',
      lastName: 'B',
      email: 'r@b.com'
    },
    'test',
    statusHandlers,
    mockPresenceClientBuilder
  );

  return {
    mockPresence,
    statusHandlers,
    apiPromise
  };
};

const flushPromises = () => new Promise(res => setImmediate(res));

const runConnection = async (mockPresence: any) => {
  // script loader promise
  await flushPromises();
  mockPresence.emit('connected');
  // connection promise
  await flushPromises();
};

describe('Presence client', () => {
  it('connects on init and registers existing presence locations', async () => {
    const { statusHandlers, mockPresence } = build();

    // script loader promise
    await flushPromises();

    expect(mockPresence.startConnection).toHaveBeenCalledTimes(1);
    mockPresence.emit('connected');

    expect(statusHandlers.onConnected).toHaveBeenCalledTimes(1);
    expect(mockPresence.subscribe).toHaveBeenCalledTimes(1);
    expect(mockPresence.subscribe.mock.calls[0][0]).toHaveLength(1);
    expect(mockPresence.subscribe.mock.calls[0][0]).toEqual(
      expect.arrayContaining(['testa'])
    );
    expect(mockPresence.enter).toHaveBeenCalledTimes(1);
    expect(mockPresence.enter.mock.calls[0][0]).toBe('testa');
    expect(mockPresence.enter.mock.calls[0][1]).toBe('meta-panel');
  });

  it('calls onUpdated handler on an update event', async () => {
    const { statusHandlers, mockPresence } = build();

    await runConnection(mockPresence);

    expect(statusHandlers.onUpdated).not.toHaveBeenCalled();
    const entry = createEntry();
    mockPresence.emit('updated', {
      subscriptionId: 'a',
      currentState: [entry]
    });
    expect(statusHandlers.onUpdated).toHaveBeenCalledWith('a', [entry]);
  });

  it('enter article re-subscribes and re-enters to the right keys', async () => {
    const { apiPromise, mockPresence } = build();

    await runConnection(mockPresence);

    const api = await apiPromise;

    api.enterArticle('b', ['a']);
    expect(mockPresence.subscribe).toHaveBeenCalledTimes(2);
    expect(mockPresence.subscribe.mock.calls[1][0]).toHaveLength(2);
    expect(mockPresence.subscribe.mock.calls[1][0]).toEqual(
      expect.arrayContaining(['testa', 'testb'])
    );
    expect(mockPresence.enter).toHaveBeenCalledTimes(2);
    expect(mockPresence.enter.mock.calls[1][0]).toBe('testb');
    expect(mockPresence.enter.mock.calls[1][1]).toBe('meta-panel');
  });

  it('exit article resubscribes', async () => {
    const { apiPromise, mockPresence } = build();

    await runConnection(mockPresence);

    const api = await apiPromise;

    api.exitArticle('b', ['a']);
    expect(mockPresence.subscribe).toHaveBeenCalledTimes(2);
    expect(mockPresence.subscribe.mock.calls[1][0]).toHaveLength(1);
    expect(mockPresence.subscribe.mock.calls[1][0]).toEqual(
      expect.arrayContaining(['testa'])
    );
    expect(mockPresence.enter).toHaveBeenCalledTimes(2);
    expect(mockPresence.enter.mock.calls[1][0]).toBe('testb');
    expect(mockPresence.enter.mock.calls[1][1]).toBeUndefined();
  });
});
