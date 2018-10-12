

import capiQuery from '../capiQuery';

describe('CAPI', () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ json: () => {} }));
  });

  describe('search', () => {
    it('makes a network request on a query', () => {
      const apiKey = 'my-api-key';
      const capi = capiQuery();
      capi.search({
        'api-key': apiKey
      });
      expect(global.fetch).toBeCalled();
      expect(global.fetch.mock.calls[0][0].includes(apiKey)).toBe(true);
      // bad heuristic to check it's going to the right endpoint
      expect(global.fetch.mock.calls[0][0].includes('search')).toBe(true);
    });
  });

  describe('tags', () => {
    it('makes a network request on a query', () => {
      const apiKey = 'my-api-key';
      const capi = capiQuery();
      capi.tags({
        'api-key': apiKey
      });
      expect(global.fetch).toBeCalled();
      expect(global.fetch.mock.calls[0][0].includes(apiKey)).toBe(true);
      // bad heuristic to check it's going to the right endpoint
      expect(global.fetch.mock.calls[0][0].includes('tags')).toBe(true);
    });
  });
});
