import configureMockStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';
import { createArticleEntitiesFromDrop, cardsReceived } from '../Cards';
import initialState from 'fixtures/initialState';
import { capiArticle } from '../../fixtures/shared';
import { createSnap, createLatestSnap } from 'shared/util/snap';
import guardianTagPage from 'shared/fixtures/guardianTagPage';
import bbcSectionPage from 'shared/fixtures/bbcSectionPage';
import { RefDrop } from 'util/collectionUtils';
import configureStore from 'util/configureStore';
import { selectOptionsModalOptions } from 'selectors/modalSelectors';
import { selectCard, selectSharedState } from 'shared/selectors/shared';

jest.mock('uuid/v4', () => () => 'card1');
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const idDrop = (id: string): RefDrop => ({ type: 'REF', data: id });

describe('Snap cards actions', () => {
  const { confirm } = window;
  const localNow = Date.now;
  const localGetTime = Date.prototype.getTime;
  const mockNow = jest.fn(() => 1487076708000);
  beforeAll(() => {
    Date.prototype.getTime = mockNow;
    Date.now = mockNow;
  });
  afterAll(() => {
    (window as any).confirm = confirm;
    Date.prototype.getTime = localGetTime;
    Date.now = localNow;
  });
  afterEach(() => fetchMock.restore());
  describe('addCard', () => {
    it('should fetch a link and create a corresponding card representing a snap link', async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          results: []
        }
      });
      fetchMock.mock('/http/proxy/https://bbc.co.uk/some/page', bbcSectionPage);
      const store = mockStore(initialState);
      await store.dispatch(createArticleEntitiesFromDrop(
        idDrop('https://bbc.co.uk/some/page')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        cardsReceived({
          card1: await createSnap('https://bbc.co.uk/some/page')
        })
      );
    });
    it('should fetch a link and create a corresponding card representing a snap link - query params in external urls should be preserved', async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          results: []
        }
      });
      fetchMock.mock(
        '/http/proxy/https://bbc.co.uk/some/page?great=true',
        bbcSectionPage
      );
      const store = mockStore(initialState);
      await store.dispatch(createArticleEntitiesFromDrop(
        idDrop('https://bbc.co.uk/some/page?great=true')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        cardsReceived({
          card1: await createSnap('https://bbc.co.uk/some/page?great=true')
        })
      );
    });
    it("should fetch tag articles and create a corresponding card representing a snap of type 'latest' given user input", async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          results: [capiArticle, capiArticle],
          tag: { webTitle: 'Example title' }
        }
      });
      fetchMock.once(
        '/http/proxy/https://www.theguardian.com/example/tag/page?view=mobile',
        guardianTagPage
      );
      const store = configureStore(initialState);
      const promise = store.dispatch(createArticleEntitiesFromDrop(
        idDrop('https://www.theguardian.com/example/tag/page')
      ) as any);
      // We can't wait for the entire promise to be done here -- we need to call the modal
      // callbacks in order for the thunk to proceed. However, the modal callbacks are only
      // available on the next event loop tick, so a setTimeout is necessary to ensure they
      // are present.
      setTimeout(() => {
        const options = selectOptionsModalOptions(store.getState());
        // This is effectively simulating clicking a modal option.
        options
          .filter(option => option.buttonText === 'Latest from')
          .forEach(option => option.callback());
      });
      await promise;
      expect(selectCard(selectSharedState(store.getState()), 'card1')).toEqual(
        createLatestSnap(
          'https://www.theguardian.com/example/tag/page',
          'Example title'
        )
      );
    });
    it("should fetch tag articles and create a corresponding card representing a snap of type 'link' given user input", async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          results: [capiArticle, capiArticle],
          tag: { webTitle: 'Example title' }
        }
      });
      fetchMock.mock(
        '/http/proxy/https://www.theguardian.com/example/tag/page?view=mobile',
        guardianTagPage
      );
      const store = configureStore(initialState);
      const promise = store.dispatch(createArticleEntitiesFromDrop(
        idDrop('https://www.theguardian.com/example/tag/page')
      ) as any);
      setTimeout(() => {
        const options = selectOptionsModalOptions(store.getState());
        options
          .filter(option => option.buttonText === 'Link')
          .forEach(option => option.callback());
      });

      await promise;
      expect(selectCard(selectSharedState(store.getState()), 'card1')).toEqual(
        await createSnap('https://www.theguardian.com/example/tag/page')
      );
    });
    it('should create a snap link if a Guardian URL is provided and no content is returned from CAPI', async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          status: 'error',
          message: 'The requested resource could not be found.'
        }
      });
      fetchMock.mock(
        '/http/proxy/https://www.theguardian.com/example/non/tag/page?view=mobile',
        guardianTagPage
      );
      const store = mockStore(initialState);
      await store.dispatch(createArticleEntitiesFromDrop(
        idDrop('https://www.theguardian.com/example/non/tag/page')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        cardsReceived({
          card1: await createSnap(
            'https://www.theguardian.com/example/non/tag/page'
          )
        })
      );
    });
    describe('snaps created from url params prefixed with gu- ', () => {
      it('should be created if they are provided in the resource id', async () => {
        const store = mockStore(initialState);
        const snapUrl =
          'https://www.theguardian.com/football/live?gu-snapType=json.html&gu-snapCss=football&gu-snapUri=https%3A%2F%2Fapi.nextgen.guardianapps.co.uk%2Ffootball%2Flive.json&gu-headline=Live+matches&gu-trailText=Today%27s+matches';
        fetchMock.mock(snapUrl, JSON.stringify({}));
        await store.dispatch(createArticleEntitiesFromDrop(
          idDrop(snapUrl)
        ) as any);
        const actions = store.getActions();
        expect(actions[0]).toEqual(
          cardsReceived({
            card1: {
              frontPublicationDate: 1487076708000,
              id: 'snap/1487076708000',
              meta: {
                byline: undefined,
                headline: 'Live matches',
                href: 'football/live',
                showByline: false,
                snapCss: 'football',
                snapType: 'json.html',
                snapUri:
                  'https://api.nextgen.guardianapps.co.uk/football/live.json',
                trailText: "Today's matches"
              },
              uuid: 'card1'
            }
          })
        );
      });
      it('should be created if they are provided on the root path', async () => {
        const store = mockStore(initialState);
        const snapUrl =
          'https://gu.com?gu-snapType=json.html&gu-snapUri=https://interactive.guim.co.uk/atoms/2019/03/29/unmeaningful-vote/snap/snap.json';
        fetchMock.mock(snapUrl, JSON.stringify({}));
        await store.dispatch(createArticleEntitiesFromDrop(
          idDrop(snapUrl)
        ) as any);
        const actions = store.getActions();
        expect(actions[0]).toEqual(
          cardsReceived({
            card1: {
              frontPublicationDate: 1487076708000,
              id: 'snap/1487076708000',
              meta: {
                byline: undefined,
                trailText: undefined,
                showByline: false,
                snapType: 'json.html',
                snapUri:
                  'https://interactive.guim.co.uk/atoms/2019/03/29/unmeaningful-vote/snap/snap.json'
              },
              uuid: 'card1'
            }
          })
        );
      });
    });
  });
});