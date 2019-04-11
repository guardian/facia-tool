import configureMockStore from 'redux-mock-store';
import configureStore from 'util/configureStore';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import config from 'fixtures/config';
import { stateWithCollection, capiArticle } from 'shared/fixtures/shared';
import { getCollectionsThunkFaciaApiResponse } from 'fixtures/collectionsEndpointResponse';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import {
  actions as externalArticleActions,
  actionNames as externalArticleActionNames
} from 'shared/bundles/externalArticlesBundle';
import {
  getCollections,
  getArticlesForCollections,
  updateCollection,
  fetchArticles
} from '../Collections';

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
        stateWithCollection.shared.collections.data.exampleCollection;
      fetchMock.once('/v2Edits', collection, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });
      fetchMock.once('/stories-visible/type', {});
      const store = mockStore({
        config,
        ...stateWithCollection
      });
      await store.dispatch(updateCollection(collection) as any);
      const actions = store.getActions();
      expect(actions[0].payload[0]).toEqual(
        collectionActions.updateStart({
          ...collection,
          updatedEmail: 'jonathon.herbert@guardian.co.uk',
          updatedBy: 'Jonathon Herbert',
          lastUpdated: 1337
        })
      );
      expect(actions[0].payload[1]).toEqual({
        type: 'RECORD_UNPUBLISHED_CHANGES',
        payload: { exampleCollection: true }
      });
      expect(actions[2]).toEqual({
        type: 'FETCH_VISIBLE_ARTICLES_SUCCESS',
        payload: {
          collectionId: 'exampleCollection',
          visibleArticles: {},
          stage: 'draft'
        }
      });
      expect(actions[1]).toEqual(
        collectionActions.updateSuccess('exampleCollection')
      );
    });
  });

  describe('Get Collections thunk', () => {
    beforeEach(() => fetchMock.reset());
    const store = configureStore({
      config,
      ...stateWithCollection
    });

    it('should add fetched Collections to the store', async () => {
      const collectionIds = ['testCollection1', 'testCollection2'];
      fetchMock.post('/collections', getCollectionsThunkFaciaApiResponse);
      await store.dispatch(getCollections(collectionIds) as any);
      expect(store.getState().shared.collections.data).toEqual({
        exampleCollection: {
          displayName: 'Example Collection',
          draft: [],
          id: 'exampleCollection',
          live: ['abc', 'def'],
          previously: undefined,
          type: 'type'
        },
        exampleCollectionTwo: {
          displayName: 'Example Collection',
          draft: ['def'],
          id: 'exampleCollection',
          live: ['abc'],
          previously: undefined,
          type: 'type'
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
          type: 'type'
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
          type: 'type'
        }
      });
    });
    it('should send only collection id and type in request body when returnOnlyUpdatedCollection is false or default', async () => {
      const collectionIds = ['testCollection1', 'testCollection2'];
      const request = fetchMock.post(
        '/collections',
        getCollectionsThunkFaciaApiResponse
      );
      await store.dispatch(getCollections(collectionIds) as any);
      const result = request.lastOptions().body;
      expect(JSON.parse(result as string)).toEqual([
        { id: 'testCollection1' },
        { id: 'testCollection2' }
      ]);
    });
    it('should send collection id, type and lastUpdated in request body when returnOnlyUpdatedCollection is true', async () => {
      const collectionIds = ['testCollection1', 'testCollection2'];
      const request = fetchMock.post(
        '/collections',
        getCollectionsThunkFaciaApiResponse
      );
      await store.dispatch(getCollections(collectionIds, true) as any);
      const result = request.lastOptions().body;
      expect(JSON.parse(result as string)).toEqual([
        { id: 'testCollection1', lastUpdated: 1547479667115 },
        { id: 'testCollection2', lastUpdated: 1547479667115 }
      ]);
    });
    it('should ignore automated collections without content', async () => {
      const collectionIds = [
        'testCollection1',
        'testCollection2',
        'automatedCollection'
      ];
      const request = fetchMock.post(
        '/collections',
        getCollectionsThunkFaciaApiResponse
      );
      await store.dispatch(getCollections(collectionIds, true) as any);
      const result = request.lastOptions().body;
      expect(JSON.parse(result as string)).toEqual([
        { id: 'testCollection1', lastUpdated: 1547479667115 },
        { id: 'testCollection2', lastUpdated: 1547479667115 }
      ]);
    });
  });

  describe('fetchArticles thunk', () => {
    const store = mockStore({
      config,
      ...stateWithCollection
    });
    beforeEach(() => {
      store.clearActions();
    });
    it('should issue fetch requests for the given articles and dispatch start and success actions', async () => {
      fetchMock.once('begin:/api/preview/internal-code/page/5029528', {
        response: { results: [capiArticle] }
      });
      await store.dispatch(fetchArticles([
        'internal-code/page/5029528'
      ]) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
      expect(actions[1]).toEqual(
        externalArticleActions.fetchSuccess([
          {
            ...capiArticle,
            id: 'internal-code/page/5029528',
            urlPath: capiArticle.id
          }
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
    it('should remove snaplinks', async () => {
      fetchMock.once('begin:/api/preview/internal-code/page/5029528', {
        response: { results: [capiArticle] }
      });
      await store.dispatch(fetchArticles([
        'internal-code/page/5029528',
        'snap/12345'
      ]) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
    });
    it("should dispatch errors when the CAPI result count doesn't match the requested articles", async () => {
      fetchMock.once('begin:/api/preview/search', {
        response: { results: [capiArticle] }
      });
      await store.dispatch(fetchArticles([
        'internal-code/page/5029528',
        'internal-code/page/12345'
      ]) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart([
          'internal-code/page/5029528',
          'internal-code/page/12345'
        ])
      );
      expect(actions[1]).toEqual(
        externalArticleActions.fetchSuccess([
          {
            ...capiArticle,
            id: 'internal-code/page/5029528',
            urlPath: capiArticle.id
          }
        ])
      );
      // We raise an error here for the missing article in the response
      expect(actions[2].type).toEqual(externalArticleActionNames.fetchError);
      expect(actions[2].payload.error).toContain('internal-code/page/12345');
    });
  });

  describe('getArticlesForCollections thunk', () => {
    it('should dispatch start and success actions for articles returned from getCollection()', async () => {
      fetchMock.once(
        'begin:/api/preview/search?ids=article/live/0,article/draft/1,a/long/path/2',
        { response: { results: [capiArticle] } }
      );
      const store = mockStore({
        config,
        ...stateWithCollection
      });
      await store.dispatch(getArticlesForCollections(
        ['exampleCollection'],
        'live'
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart([
          'article/live/0',
          'article/draft/1',
          'a/long/path/2'
        ])
      );
      // We don't care about the implementation of getArticle here,
      // so we just check that the action type is correct
      expect(actions[1].type).toEqual(externalArticleActionNames.fetchSuccess);
    });
    it('should dispatch start and error actions when getArticles throws', async () => {
      fetchMock.once(
        'begin:/api/preview/search?ids=article/live/0,article/draft/1,a/long/path/2',
        400
      );
      const store = mockStore({
        config,
        ...stateWithCollection
      });
      await store.dispatch(getArticlesForCollections(
        ['exampleCollection'],
        'live'
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart([
          'article/live/0',
          'article/draft/1',
          'a/long/path/2'
        ])
      );
      expect(actions[1].type).toEqual(externalArticleActionNames.fetchError);
      expect(actions[1].payload.error).toContain('400');
    });
  });
});
