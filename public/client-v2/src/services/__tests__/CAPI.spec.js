import capiQuery from '../capiQuery';

describe('CAPI', () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ json: () => {} }));
  });

  describe('query', () => {
    it('makes a network request on a query', () => {
      const apiKey = 'my-api-key';
      const capi = capiQuery(apiKey);
      capi.search({});
      expect(global.fetch).toBeCalled();
      expect(global.fetch.mock.calls[0][0].includes(apiKey)).toBe(true);
    });
  });
});
