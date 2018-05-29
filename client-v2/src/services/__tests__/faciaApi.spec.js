// @flow

import fetchMock from 'fetch-mock';
import { fetchLastPressed } from '../faciaApi';

describe('faciaApi', () => {
  afterEach(fetchMock.restore);
  describe('fetchLastPressed', () => {
    it('should fetch the last modified date from the appropriate endpoint', () => {
      fetchMock.once(
        '/front/lastmodified/live/exampleId',
        '2018-05-24T09:42:20.580Z'
      );
      expect.assertions(1);
      return expect(fetchLastPressed('exampleId', 'live')).resolves.toEqual(
        new Date('2018-05-24T09:42:20.580Z')
      );
    });
  });

  it("should reject with an appropriate error message if the front isn't found", async () => {
    fetchMock.once('/front/lastmodified/draft/exampleId', 404);
    expect.assertions(1);
    try {
      await fetchLastPressed('exampleId', 'draft');
    } catch (e) {
      expect(e.message).toContain('exampleId');
    }
  });

  it("should reject with a nice error message if the front isn't found", async () => {
    fetchMock.once('/front/lastmodified/draft/exampleId', {
      status: 500,
      body: 'Server error'
    });
    expect.assertions(3);
    try {
      await fetchLastPressed('exampleId', 'draft');
    } catch (e) {
      expect(e.message).toContain('exampleId');
      expect(e.message).toContain(500);
      expect(e.message).toContain('Server error');
    }
  });

  it('should reject if the server responds with a bad date', async () => {
    fetchMock.once('/front/lastmodified/draft/exampleId', "That ain't right");
    expect.assertions(1);
    try {
      await fetchLastPressed('exampleId', 'draft');
    } catch (e) {
      expect(e.message).toContain('exampleId');
    }
  });
});
