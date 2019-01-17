import configureStore from 'util/configureStore';
import fetchMock from 'fetch-mock';
import 'whatwg-fetch';
import {
  fetchLive,
  fetchPreview,
  liveSelectors,
  previewSelectors
} from '../capiFeedBundle';
import { capiArticle } from 'shared/fixtures/shared';

const resources = [
  { fetchAction: fetchLive, selectors: liveSelectors, endpoint: 'live' },
  {
    fetchAction: fetchPreview,
    selectors: previewSelectors,
    endpoint: 'preview'
  }
];
const createStoreAndFetchMock = (
  pattern: string,
  response: any,
  status = 200
) => {
  fetchMock.get(pattern, response, { overwriteRoutes: true });
  return configureStore();
};

describe('capiFeedBundle', () => {
  beforeEach(() => fetchMock.reset());
  it('should add CAPI results to the application state', async () => {
    await Promise.all(
      resources.map(async resource => {
        const store = createStoreAndFetchMock(
          `begin:/api/${resource.endpoint}/search`,
          {
            response: {
              results: [capiArticle]
            }
          }
        );
        await store.dispatch(resource.fetchAction(
          {
            q: 'Something topical'
          },
          false
        ) as any);
        expect(resource.selectors.selectAll(store.getState())).toEqual([
          capiArticle
        ]);
      })
    );
  });
  it('should add a single CAPI content result to the application state', async () => {
    await Promise.all(
      resources.map(async resource => {
        const store = createStoreAndFetchMock(
          `begin:/api/${resource.endpoint}/a/single/resource`,
          {
            response: {
              content: capiArticle
            }
          }
        );
        await store.dispatch(resource.fetchAction(
          {
            q: 'a/single/resource'
          },
          true
        ) as any);
        expect(resource.selectors.selectAll(store.getState())).toEqual([
          capiArticle
        ]);
      })
    );
  });
  it('should handle HTTP errors', async () => {
    await Promise.all(
      resources.map(async resource => {
        const store = createStoreAndFetchMock(
          `begin:/api/${resource.endpoint}/search`,
          400
        );
        await store.dispatch(resource.fetchAction(
          {
            q: 'Something topical'
          },
          false
        ) as any);
        expect(resource.selectors.selectAll(store.getState())).toEqual([]);
        expect(resource.selectors.selectCurrentError(store.getState())).toMatch(
          /400/
        );
      })
    );
  });
  it('should handle an invalid response from the server', async () => {
    await Promise.all(
      resources.map(async resource => {
        const store = createStoreAndFetchMock(
          `begin:/api/${resource.endpoint}/search`,
          '{This is not JSON}'
        );
        await store.dispatch(resource.fetchAction(
          {
            q: 'Something topical'
          },
          false
        ) as any);
        expect(resource.selectors.selectAll(store.getState())).toEqual([]);
        expect(resource.selectors.selectCurrentError(store.getState())).toMatch(
          /Error parsing a response/
        );
      })
    );
  });
  it('should handle CAPI errors', async () => {
    await Promise.all(
      resources.map(async resource => {
        const store = createStoreAndFetchMock(
          `begin:/api/${resource.endpoint}/search`,
          { response: { status: 'error', message: 'CAPI is unwell' } }
        );
        await store.dispatch(resource.fetchAction(
          {
            q: 'Something topical'
          },
          false
        ) as any);
        expect(resource.selectors.selectAll(store.getState())).toEqual([]);
        expect(resource.selectors.selectCurrentError(store.getState())).toMatch(
          /CAPI is unwell/
        );
      })
    );
  });
});
