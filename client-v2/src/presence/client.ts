import { Entry, UpdateResponse, UserSpec } from './types';

const PRESENCE_DOMAIN = 'presence.local.dev-gutools.co.uk';

const loadExternalScript = (url: string) =>
  new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = url;
    el.onload = res;
    el.onerror = rej;
    document.head.appendChild(el);
  });

const getPresenceClient = () =>
  loadExternalScript(`https://${PRESENCE_DOMAIN}/client/1/lib.min.js`).then(
    () => {
      const { presenceClient } = window as any;
      if (!presenceClient) {
        throw new Error('Something went wrong loading presence');
      }
      return presenceClient;
    }
  );

const connect = (presence: any) => {
  presence.startConnection();
  presence.addListener('connectionLog', (ev: any) => {
    console.info('Presence info: ' + ev.event, ev.data);
  });
  return new Promise(res => {
    presence.addListener('connected', res);
  });
};

const init = async (
  presenceDomain: string,
  user: UserSpec,
  storagePrefix: string,
  onUpdated: (id: string, entries: Entry[]) => void
) => {
  // currently using the composer presence service to aid visibility, prefix with fronts
  const addFrontsPrefix = (key: string) => `${storagePrefix}---${key}`;
  const removeFrontsPrefix = (key: string) =>
    key.replace(`${storagePrefix}---`, '');

  // should make the client a singleton here
  const client = await getPresenceClient();
  const presence = client({
    user,
    presenceDomain
  });

  await connect(presence);

  // presence.addListener('subscribed', (...args: any[]) => {
  //   console.log('sbbd', ...args);
  // });

  presence.addListener('updated', (res: UpdateResponse) =>
    onUpdated(
      removeFrontsPrefix(res.subscriptionId),
      res.currentState.filter(
        (entry: any) =>
          entry.clientId.connId !== presence.connectionId &&
          entry.location !== ' '
      )
    )
  );

  function exitArticle(articleKey: string) {
    // enter no-mans land, can't exit something in presence
    presence.enter(addFrontsPrefix(articleKey));
    // unsbuscribe from updates about this article
    presence.subscribe([]);
  }

  function enterArticle(articleKey: string) {
    presence.subscribe([addFrontsPrefix(articleKey)]);
    presence.enter(addFrontsPrefix(articleKey), 'meta-panel');
  }

  return {
    exitArticle,
    enterArticle
  };
};

export { init };
