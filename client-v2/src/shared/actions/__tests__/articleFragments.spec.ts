import {
  createArticleFragment,
  articleFragmentsReceived
} from '../ArticleFragments';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';
import { capiArticle } from '../../fixtures/shared';
import { actionNames as externalArticleActionNames } from 'shared/bundles/externalArticlesBundle';
import { createFragment } from 'shared/util/articleFragment';
import { createLinkSnap, createLatestSnap } from 'shared/util/snap';
import guardianTagPage from 'shared/fixtures/guardianTagPage';
import bbcSectionPage from 'shared/fixtures/bbcSectionPage';
import { RefDrop } from 'util/collectionUtils';

jest.mock('uuid/v4', () => () => 'uuid');
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const idDrop = (id: string): RefDrop => ({ type: 'REF', data: id });

describe('articleFragments actions', () => {
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
  describe('addArticleFragment', () => {
    it('should fetch an article and create a corresponding collection item representing an article', async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          results: [capiArticle]
        }
      });
      const store = mockStore({});
      await store.dispatch(createArticleFragment(
        idDrop('internal-code/page/5029528')
      ) as any);
      const actions = store.getActions();
      expect(actions[0].type).toEqual(externalArticleActionNames.fetchSuccess);
      expect(actions[1]).toEqual(
        articleFragmentsReceived({
          uuid: createFragment('internal-code/page/5029528')
        })
      );
    });
    it('should fetch a link and create a corresponding collection item representing a snap link', async () => {
      fetchMock.once('begin:/api/preview', {
        response: {
          results: []
        }
      });
      fetchMock.mock('/http/proxy/https://bbc.co.uk/some/page', bbcSectionPage);
      const store = mockStore({});
      await store.dispatch(createArticleFragment(
        idDrop('https://bbc.co.uk/some/page')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        articleFragmentsReceived({
          uuid: await createLinkSnap('https://bbc.co.uk/some/page')
        })
      );
    });
    it("should fetch tag articles and create a corresponding collection item representing a snap of type 'latest' given user input", async () => {
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
      (window as any).confirm = jest.fn(() => true);
      const store = mockStore({});
      await store.dispatch(createArticleFragment(
        idDrop('https://www.theguardian.com/example/tag/page')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        articleFragmentsReceived({
          uuid: await createLatestSnap(
            'https://www.theguardian.com/example/tag/page',
            'Example title'
          )
        })
      );
    });
    it("should fetch tag articles and create a corresponding collection item representing a snap of type 'link' given user input", async () => {
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
      (window as any).confirm = jest.fn(() => false);
      const store = mockStore({});
      await store.dispatch(createArticleFragment(
        idDrop('https://www.theguardian.com/example/tag/page')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        articleFragmentsReceived({
          uuid: await createLinkSnap(
            'https://www.theguardian.com/example/tag/page'
          )
        })
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
      const store = mockStore({});
      await store.dispatch(createArticleFragment(
        idDrop('https://www.theguardian.com/example/non/tag/page')
      ) as any);
      const actions = store.getActions();
      expect(actions[0]).toEqual(
        articleFragmentsReceived({
          uuid: await createLinkSnap(
            'https://www.theguardian.com/example/non/tag/page'
          )
        })
      );
    });
  });
});
