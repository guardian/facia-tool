import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import config from 'fixtures/config';
import { stateWithCollection, capiArticle } from 'shared/fixtures/shared';
import { actions as collectionActions } from 'shared/bundles/collectionsBundle';
import {
  actions as externalArticleActions,
  actionNames as externalArticleActionNames
} from 'shared/bundles/externalArticlesBundle';
import { getCollectionsAndArticles, updateCollection, fetchArticles } from '../Collections';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

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
      expect(actions[1]).toEqual(
        collectionActions.updateSuccess('exampleCollection', collection)
      );
    });
  });

  describe('fetchArticles thunk', () => {
    const store = mockStore({
      config,
      ...stateWithCollection
    });
    beforeEach(() => {
      store.clearActions();
    })
    it('should issue fetch requests for the given articles and dispatch start and success actions', async () => {
      fetchMock.once(
        'begin:/api/preview/search',
        { response: { results: [capiArticle] } }
      );
      await store.dispatch(fetchArticles(['internal-code/page/5029528']) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
      expect(actions[1]).toEqual(externalArticleActions.fetchSuccess([
        {
          ...capiArticle,
          id: 'internal-code/page/5029528',
          urlPath: capiArticle.id
        }
      ]));
    });
    it('should dispatch start and error actions when something goes wrong', async () => {
      fetchMock.once(
        'begin:/api/preview/search',
        400
      );
      await store.dispatch(fetchArticles(['internal-code/page/1']) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/1'])
      );
      expect(actions[1].type).toEqual(externalArticleActionNames.fetchError);
    });
    it('should remove snaplinks', async () => {
      fetchMock.once(
        'begin:/api/preview/search',
        { response: { results: [capiArticle] } }
      );
      await store.dispatch(fetchArticles(['internal-code/page/5029528', 'snap/12345']) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528'])
      );
    });
    it('should dispatch errors when the CAPI result count doesn\'t match the requested articles', async () => {
      fetchMock.once(
        'begin:/api/preview/search',
        { response: { results: [capiArticle] } }
      );
      await store.dispatch(fetchArticles(['internal-code/page/5029528', 'internal-code/page/12345']) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart(['internal-code/page/5029528', 'internal-code/page/12345'])
      );
      expect(actions[1]).toEqual(externalArticleActions.fetchSuccess([
        {
          ...capiArticle,
          id: 'internal-code/page/5029528',
          urlPath: capiArticle.id
        }
      ]));
      // We raise an error here for the missing article in the response
      expect(actions[2].type).toEqual(externalArticleActionNames.fetchError);
      expect(actions[2].payload.error).toContain('internal-code/page/12345');
    });
  });

  describe('getCollectionsAndArticles thunk', () => {
    it('should dispatch start and success actions for articles returned from getCollection()', async () => {
      const collection: any =
        stateWithCollection.shared.collections.data.exampleCollection;
      fetchMock.once('/collection/exampleCollection', collection);
      fetchMock.once(
        'begin:/api/preview/search',
        { response: { results: [capiArticle] } }
      );
      const store = mockStore({
        config,
        ...stateWithCollection
      });
      await store.dispatch(
        getCollectionsAndArticles(['exampleCollection'], (() => () =>
          Promise.resolve([capiArticle.id]) as any)
        ) as any
      );
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart([capiArticle.id])
      );
      // We don't care about the implementation of getArticle here,
      // so we just check that the action type is correct
      expect(actions[1].type).toEqual(externalArticleActionNames.fetchSuccess);
    });
    it('should dispatch start and error actions when getArticles throws', async () => {
      const collection: any =
        stateWithCollection.shared.collections.data.exampleCollection;
      fetchMock.once('/collection/exampleCollection', collection);
      fetchMock.once('begin:/api/preview/search', 400);
      const store = mockStore({
        config,
        ...stateWithCollection
      });
      await store.dispatch(
        getCollectionsAndArticles(['exampleCollection'], () => () =>
          Promise.resolve([capiArticle.id])
        ) as any
      );
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        externalArticleActions.fetchStart([capiArticle.id])
      );
      expect(actions[1].type).toEqual(externalArticleActionNames.fetchError);
      expect(actions[1].payload.error).toContain('400');
    });
  });
});
