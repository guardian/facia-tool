import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import set from 'lodash/fp/set';
import configureStore from 'util/configureStore';
import config from 'fixtures/config';
import {
  stateWithCollection,
  capiArticle,
  stateWithDuplicateArticleIdsInCollection,
  stateWithCollectionWithChefs,
  stateWithCollectionWithDuplicateChefs,
} from 'fixtures/shared';
import {
  getCollectionsApiResponse,
  getCollectionsApiResponseWithoutStoriesVisible,
} from 'fixtures/collectionsEndpointResponse';
import { actions as collectionActions } from 'bundles/collectionsBundle';
import {
  actions as externalArticleActions,
  actionNames as externalArticleActionNames,
} from 'bundles/externalArticlesBundle';
import {
  actions as chefActions,
  actionNames as chefActionNames,
} from 'bundles/chefsBundle';
import {
  getCollections,
  fetchCardReferencedEntities,
  updateCollection,
  fetchArticles,
} from '../Collections';
import { createSelectCollection } from 'selectors/shared';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('uuid/v4', () => () => 'uuid');

describe('Collection actions', () => {
  const { now } = Date;
  afterEach(fetchMock.restore);
  beforeAll(() => {
    (Date as any).now = () => 1337;
  });
  afterAll(() => {
    (Date as any).now = now;
  });
  describe('Update collection thunk', () => {
    it('should issue a collection update', async () => {
      const collection: any =
        stateWithCollection.collections.data.exampleCollection;
      fetchMock.once('/v2Edits', collection, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      fetchMock.once('/stories-visible/type', {});
      const store = mockStore({
        config,
        ...stateWithCollection,
      });
      await store.dispatch(updateCollection(collection) as any);
      const actions = store.getActions();
      expect(actions[0].payload[0]).toEqual(
        collectionActions.updateStart({
          ...collection,
          updatedEmail: 'jonathon.herbert@guardian.co.uk',
          updatedBy: 'Jonathon Herbert',
          lastUpdated: 1337,
        })
      );
      expect(actions[0].payload[1]).toEqual({
        type: 'RECORD_UNPUBLISHED_CHANGES',
        payload: { exampleCollection: true },
      });
      expect(actions[2]).toEqual({
        type: 'FETCH_VISIBLE_ARTICLES_SUCCESS',
        payload: {
          collectionId: 'exampleCollection',
          visibleArticles: {},
          stage: 'draft',
        },
      });
      expect(actions[1]).toEqual(
        collectionActions.updateSuccess('exampleCollection')
      );
    });

    it('should handle collections without types in a a collection update', async () => {
      const { type, ...collection }: any =
        stateWithCollection.collections.data.exampleCollection;

      fetchMock.once('/v2Edits', collection, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const store = mockStore({
        config,
        ...stateWithCollection,
      });

      await store.dispatch(updateCollection(collection) as any);
      const actions = store.getActions();
      expect(actions[2]).toEqual(undefined);
    });
  });

  describe('Get Collections thunk', () => {
    beforeEach(() => fetchMock.reset());
    const store = configureStore(
      {
        config,
        ...stateWithCollection,
      },
      '/v2/editorial'
    );

    it('should add fetched Collections to the store', async () => {
      const collectionIds = [
        'testCollection1',
        'testCollection2',
        'geoLocatedCollection',
      ];
      fetchMock.post('/collections', getCollectionsApiResponse);
      await store.dispatch(getCollections(collectionIds) as any);
      expect(store.getState().collections.data).toEqual({
        exampleCollection: {
          displayName: 'Example Collection',
          draft: [],
          id: 'exampleCollection',
          live: ['abc', 'def'],
          previously: undefined,
          type: 'type',
        },
        exampleCollectionTwo: {
          displayName: 'Example Collection',
          draft: ['def'],
          id: 'exampleCollection',
          live: ['abc'],
          previously: undefined,
          type: 'type',
        },
        testCollection1: {
          displayName: 'testCollection',
          draft: ['uuid'],
          frontsToolSettings: undefined,
          groups: undefined,
          id: 'testCollection1',
          lastUpdated: 1547479667115,
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          type: 'type',
        },
        testCollection2: {
          displayName: 'testCollection',
          draft: ['uuid'],
          frontsToolSettings: undefined,
          groups: undefined,
          id: 'testCollection2',
          lastUpdated: 1547479667115,
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          type: 'type',
        },
        geoLocatedCollection: {
          displayName: 'New Zealand News',
          draft: ['uuid'],
          frontsToolSettings: undefined,
          groups: undefined,
          id: 'geoLocatedCollection',
          lastUpdated: 1547479667115,
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          type: 'type',
          targetedTerritory: 'NZ',
        },
      });
    });
    it('should add fetched automated collections to the store', async () => {
      const collectionIds = ['automatedCollection'];
      fetchMock.post('/collections', []);
      await store.dispatch(getCollections(collectionIds) as any);
      expect(store.getState().collections.data).toEqual({
        exampleCollection: {
          displayName: 'Example Collection',
          draft: [],
          id: 'exampleCollection',
          live: ['abc', 'def'],
          previously: undefined,
          type: 'type',
        },
        exampleCollectionTwo: {
          displayName: 'Example Collection',
          draft: ['def'],
          id: 'exampleCollection',
          live: ['abc'],
          previously: undefined,
          type: 'type',
        },
        automatedCollection: {
          id: 'automatedCollection',
          displayName: 'automated',
          type: 'type',
          draft: ['uuid'],
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          groups: undefined,
          frontsToolSettings: undefined,
        },
        testCollection1: {
          displayName: 'testCollection',
          draft: ['uuid'],
          frontsToolSettings: undefined,
          groups: undefined,
          id: 'testCollection1',
          lastUpdated: 1547479667115,
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          type: 'type',
        },
        testCollection2: {
          displayName: 'testCollection',
          draft: ['uuid'],
          frontsToolSettings: undefined,
          groups: undefined,
          id: 'testCollection2',
          lastUpdated: 1547479667115,
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          type: 'type',
        },
        geoLocatedCollection: {
          displayName: 'New Zealand News',
          draft: ['uuid'],
          frontsToolSettings: undefined,
          groups: undefined,
          id: 'geoLocatedCollection',
          lastUpdated: 1547479667115,
          live: ['uuid'],
          metadata: undefined,
          platform: undefined,
          previously: ['uuid'],
          previouslyCardIds: [],
          type: 'type',
          targetedTerritory: 'NZ',
        },
      });
    });

    it('should send only collection id and type in request body when returnOnlyUpdatedCollection is false or default', async () => {
      const collectionIds = ['testCollection1', 'testCollection2'];
      const request = fetchMock.post('/collections', getCollectionsApiResponse);
      await store.dispatch(getCollections(collectionIds) as any);
      const result = request.lastOptions().body;
      expect(JSON.parse(result as string)).toEqual([
        { id: 'testCollection1' },
        { id: 'testCollection2' },
      ]);
    });
    it('should handle an empty storiesVisibleByStage object in the server response', async () => {
      const collectionIds = ['testCollection1'];
      fetchMock.post(
        '/collections',
        getCollectionsApiResponseWithoutStoriesVisible
      );
      await store.dispatch(getCollections(collectionIds) as any);
      const selector = createSelectCollection();
      const state = store.getState();
      expect(
        selector(state, { collectionId: 'testCollection1' }).displayName
      ).toEqual('testCollection');
    });
    it('should send collection id, type and lastUpdated in request body when returnOnlyUpdatedCollection is true', async () => {
      const collectionIds = ['testCollection1', 'testCollection2'];
      const request = fetchMock.post('/collections', getCollectionsApiResponse);
      await store.dispatch(getCollections(collectionIds, true) as any);
      const result = request.lastOptions().body;
      expect(JSON.parse(result as string)).toEqual([
        { id: 'testCollection1', lastUpdated: 1547479667115 },
        { id: 'testCollection2', lastUpdated: 1547479667115 },
      ]);
    });
    it('should correctly poll for changes in automated collections', async () => {
      const collectionIds = [
        'testCollection1',
        'testCollection2',
        'automatedCollection',
      ];
      const request = fetchMock.post('/collections', getCollectionsApiResponse);
      await store.dispatch(getCollections(collectionIds, true) as any);
      const result = request.lastOptions().body;
      expect(JSON.parse(result as string)).toEqual([
        { id: 'testCollection1', lastUpdated: 1547479667115 },
        { id: 'testCollection2', lastUpdated: 1547479667115 },
        { id: 'automatedCollection' },
      ]);
    });
  });

  describe('fetchArticles thunk', () => {
    const store = mockStore({
      config,
      ...stateWithCollection,
    });
    beforeEach(() => {
      store.clearActions();
    });
    it('should issue fetch requests for the given articles and dispatch start and success actions', async () => {
      fetchMock.once('begin:/api/preview/internal-code/page/5029528', {
        response: { results: [capiArticle] },
      });
      await store.dispatch(
        fetchArticles(['internal-code/page/5029528']) as any
      );
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
      expect(actions[1]).toEqual(
        externalArticleActions.fetchSuccess([
          {
            ...capiArticle,
            id: 'internal-code/page/5029528',
            urlPath: capiArticle.id,
          },
        ])
      );
    });
    it('should dispatch start and error actions when something goes wrong', async () => {
      fetchMock.once('begin:/api/preview/internal-code/page/1', 400);
      await store.dispatch(fetchArticles(['internal-code/page/1']) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/1'])
      );
      expect(actions[1].type).toEqual(externalArticleActionNames.fetchError);
    });
    it("should not add articles to the state if they're not stale", async () => {
      const initialState = {
        config,
        ...stateWithCollection,
      };
      const olderArticle = set(
        ['fields', 'lastModified'],
        '2018-10-10T10:10:09Z',
        capiArticle
      );
      const newerArticle = set(
        ['fields', 'lastModified'],
        '2018-10-10T10:10:11Z',
        capiArticle
      );
      const state = set(
        ['externalArticles', 'data', 'internal-code/page/5029528'],
        newerArticle,
        initialState
      );
      const storeWithStaleArticle = mockStore(state);
      fetchMock.once('begin:/api/preview/internal-code/page/5029528', {
        response: {
          results: [olderArticle],
        },
      });
      await storeWithStaleArticle.dispatch(
        fetchArticles(['internal-code/page/5029528']) as any
      );
      const actions = storeWithStaleArticle.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
      // There's nothing to dispatch -- the incoming article is not newer than the one held in the state
      expect(actions[1]).toEqual(undefined);
    });
    it('should remove snaplinks', async () => {
      fetchMock.once('begin:/api/preview/internal-code/page/5029528', {
        response: { results: [capiArticle] },
      });
      await store.dispatch(
        fetchArticles(['internal-code/page/5029528', 'snap/12345']) as any
      );
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
    });
    it("should dispatch errors when the CAPI result count doesn't match the requested articles", async () => {
      fetchMock.once('begin:/api/preview/search', {
        response: { results: [capiArticle] },
      });
      await store.dispatch(
        fetchArticles([
          'internal-code/page/5029528',
          'internal-code/page/12345',
        ]) as any
      );
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart([
          'internal-code/page/5029528',
          'internal-code/page/12345',
        ])
      );
      expect(actions[1]).toEqual(
        externalArticleActions.fetchSuccess([
          {
            ...capiArticle,
            id: 'internal-code/page/5029528',
            urlPath: capiArticle.id,
          },
        ])
      );
      // We raise an error here for the missing article in the response
      expect(actions[2].type).toEqual(externalArticleActionNames.fetchError);
      expect(actions[2].payload.error).toContain('internal-code/page/12345');
    });
  });

  describe('fetchCardReferencedEntities thunk', () => {
    const assertFetchedEntities = async ({
      fixture,
      action,
      endpoint,
      fetchStartAction,
      fetchCompleteActionType,
      fetchResponse = { response: { results: [capiArticle] } },
    }: {
      fixture: Record<string, unknown>;
      action: any;
      endpoint: string;
      fetchStartAction: unknown;
      fetchCompleteActionType: string;
      fetchResponse?: number | Record<string, unknown>;
    }) => {
      fetchMock.once(endpoint, fetchResponse);
      const store = mockStore({
        config,
        ...fixture,
      });
      await store.dispatch(action);
      const actions = store.getActions();
      expect(actions[0]).toEqual(fetchStartAction);
      expect(actions[1].type).toEqual(fetchCompleteActionType);
    };

    it('should dispatch start and success actions for articles returned from getCollection()', async () => {
      await assertFetchedEntities({
        fixture: stateWithCollection,
        action: fetchCardReferencedEntities(['exampleCollection'], 'live'),
        endpoint:
          'begin:/api/preview/search?ids=article/live/0,article/draft/1,a/long/path/2',
        fetchStartAction: externalArticleActions.fetchStart([
          'article/live/0',
          'article/draft/1',
          'a/long/path/2',
        ]),
        fetchCompleteActionType: externalArticleActionNames.fetchSuccess,
      });
    });
    it('should deduplicate article ids when two cards reference the same article', async () => {
      await assertFetchedEntities({
        fixture: stateWithDuplicateArticleIdsInCollection,
        action: fetchCardReferencedEntities(['exampleCollection'], 'live'),
        endpoint: 'begin:/api/preview/search?ids=article/live/0,a/long/path/2',
        fetchStartAction: externalArticleActions.fetchStart([
          'article/live/0',
          'a/long/path/2',
        ]),
        fetchCompleteActionType: externalArticleActionNames.fetchSuccess,
      });
    });

    it('should dispatch start and error actions when getPrefillArticles throws', async () => {
      await assertFetchedEntities({
        fixture: stateWithDuplicateArticleIdsInCollection,
        action: fetchCardReferencedEntities(['exampleCollection'], 'live'),
        endpoint: 'begin:/api/preview/search?ids=article/live/0,a/long/path/2',
        fetchStartAction: externalArticleActions.fetchStart([
          'article/live/0',
          'a/long/path/2',
        ]),
        fetchCompleteActionType: externalArticleActionNames.fetchError,
        fetchResponse: 400,
      });
    });

    it('should dispatch start and success actions for chefs returned from getCollection()', async () => {
      await assertFetchedEntities({
        fixture: stateWithCollectionWithChefs,
        action: fetchCardReferencedEntities(['exampleCollection'], 'live'),
        endpoint:
          'begin:/api/live/tags?type=contributor&ids=profile%2Fyotamottolenghi%2Cprofile%2Frick-stein%2Cprofile%2Ffelicity-cloake',
        fetchStartAction: chefActions.fetchStart([
          'profile/yotamottolenghi',
          'profile/rick-stein',
          'profile/felicity-cloake',
        ]),
        fetchCompleteActionType: chefActionNames.fetchSuccess,
      });
    });

    it('should deduplicate chef ids', async () => {
      await assertFetchedEntities({
        fixture: stateWithCollectionWithDuplicateChefs,
        action: fetchCardReferencedEntities(['exampleCollection'], 'live'),
        endpoint:
          'begin:/api/live/tags?type=contributor&ids=profile%2Fyotamottolenghi%2Cprofile%2Frick-stein',
        fetchStartAction: chefActions.fetchStart([
          'profile/yotamottolenghi',
          'profile/rick-stein',
        ]),
        fetchCompleteActionType: chefActionNames.fetchSuccess,
      });
    });
  });
});
