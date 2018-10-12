

import fetchMock from 'fetch-mock';
import { fetchLastPressed, updateCollection } from '../faciaApi';

describe('faciaApi', () => {
  afterEach(fetchMock.restore);
  describe('fetchLastPressed', () => {
    it('should fetch the last modified date from the appropriate endpoint', () => {
      fetchMock.once(
        '/front/lastmodified/exampleId',
        '2018-05-24T09:42:20.580Z'
      );
      expect.assertions(1);
      return expect(fetchLastPressed('exampleId')).resolves.toBe(
        '2018-05-24T09:42:20.580Z'
      );
    });

    it('should reject with an appropriate error message if the server throws an error', async () => {
      fetchMock.once('/front/lastmodified/exampleId', {
        status: 500,
        body: 'Server error'
      });
      expect.assertions(3);
      try {
        await fetchLastPressed('exampleId');
      } catch (e) {
        expect(e.message).toContain('exampleId');
        expect(e.message).toContain(500);
        expect(e.message).toContain('Server error');
      }
    });

    it('should reject if the server responds with a bad date', async () => {
      fetchMock.once('/front/lastmodified/exampleId', "That ain't right");
      expect.assertions(1);
      try {
        await fetchLastPressed('exampleId');
      } catch (e) {
        expect(e.message).toContain('exampleId');
      }
    });
  });
  describe('updateCollection', () => {
    const collection: any = {
      displayName: 'exampleCollection'
    };
    it('should issue a post request to the update endpoint', () => {
      fetchMock.once('/v2Edits', collection, {
        headers: { 'Content-Type': 'application/json' },
        matcher: (url, opts) =>
          opts.body ===
          JSON.stringify({
            id: 'exampleId',
            collection
          })
      });
      expect.assertions(1);
      return expect(updateCollection('exampleId', collection)).resolves.toEqual(
        collection
      );
    });
    it('should reject if the server gives a !2XX response', async () => {
      fetchMock.once('/v2Edits', { status: 400 });
      expect.assertions(1);
      try {
        await updateCollection('exampleId', collection);
      } catch (e) {
        expect(e.message).toContain('exampleId');
      }
    });
  });
});
