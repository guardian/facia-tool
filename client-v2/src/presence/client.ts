import { Entry, UserSpec, PresenceClient } from './types';

const loadExternalScript = (url: string) =>
  new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = url;
    el.onload = res;
    el.onerror = rej;
    document.head.appendChild(el);
  });

const getPresenceClientInner = (
  presenceDomain: string
): Promise<PresenceClient> =>
  loadExternalScript(`https://${presenceDomain}/client/1/lib.min.js`).then(
    () => {
      const { presenceClient } = window as any;
      if (!presenceClient) {
        throw new Error('Something went wrong loading presence');
      }
      return presenceClient;
    }
  );

const awaitConnection = (presence: any) =>
  new Promise(res => presence.once('connected', res));

interface PresenceEventHandlers {
  onUpdated?: (id: string, entries: Entry[]) => void;
  onConnected?: () => string[]; // array of ids to enter
  onDisconnected?: () => void;
}

const init = async (
  presenceDomain: string,
  user: UserSpec,
  storagePrefix = '',
  {
    onUpdated = () => {},
    onConnected = () => [],
    onDisconnected = () => {}
  }: PresenceEventHandlers = {},
  getPresenceClient: (
    domain: string
  ) => Promise<PresenceClient> = getPresenceClientInner
) => {
  // currently using the composer presence service to aid visibility, prefix with fronts
  const addFrontsPrefix = (key: string) => `${storagePrefix}${key}`;
  const removeFrontsPrefix = (key: string) =>
    key.replace(`${storagePrefix}`, '');

  // should make the client a singleton here
  const client = await getPresenceClient(presenceDomain);
  const presence = client({
    user,
    presenceDomain
  });

  function exitArticles(articleKeys: string[], existingArticleKeys: string[]) {
    // enter no-mans land, can't exit something in presence
    articleKeys.forEach((articleKey: string) => {
      presence.enter(addFrontsPrefix(articleKey));
    });
    // unsbuscribe from updates about this article
    presence.subscribe(
      existingArticleKeys
        .filter(key => !articleKeys.includes(key))
        .map(addFrontsPrefix)
    );
  }

  function exitArticle(articleKey: string, existingArticleKeys: string[]) {
    exitArticles([articleKey], existingArticleKeys);
  }

  function enterArticles(articleKeys: string[], existingArticleKeys: string[]) {
    const prefixedArticlesKeys = articleKeys.map(addFrontsPrefix);
    presence.subscribe([
      ...prefixedArticlesKeys,
      ...existingArticleKeys.map(addFrontsPrefix)
    ]);
    prefixedArticlesKeys.forEach((prefixedArticlesKey: string) => {
      presence.enter(prefixedArticlesKey, 'meta-panel');
    });
  }

  function enterArticle(articleKey: string, existingArticleKeys: string[]) {
    enterArticles([articleKey], existingArticleKeys);
  }

  presence.startConnection();
  presence.addListener('connectionLog', (e: any) => {
    console.info('Presence info: ' + e.event, e.data);
  });
  presence.addListener('disconnected', (e: any) => {
    onDisconnected();
    console.info('Presence info: ' + e.event, e.data);
  });
  presence.addListener('connected', () => {
    enterArticles(onConnected(), []);
  });
  presence.addListener('updated', res =>
    onUpdated(
      removeFrontsPrefix(res.subscriptionId),
      res.currentState.filter(
        (entry: any) =>
          // entry.clientId.connId !== presence.connectionId &&
          entry.location !== ' '
      )
    )
  );

  await awaitConnection(presence);

  // presence.addListener('subscribed', (...args: any[]) => {
  //   console.log('sbbd', ...args);
  // });

  return {
    exitArticle,
    enterArticle
  };
};

export { init };
