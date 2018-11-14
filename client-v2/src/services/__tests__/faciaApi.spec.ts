import fetchMock from 'fetch-mock';
import {
  fetchLastPressed,
  updateCollection,
  getCapiUriForContentIds,
  getArticlesBatched,
  getArticles
} from '../faciaApi';
import chunk from 'lodash/chunk';

describe('faciaApi', () => {
  afterEach(() => fetchMock.restore());
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
  describe('getArticlesBatched', () => {
    it('should issue a CAPI request for an array of article ids', async () => {
      fetchMock.once(
        getCapiUriForContentIds(['article1', 'article2']),
        '{"response":{ "results": [] }}'
      );
      await getArticlesBatched(['article1', 'article2']);
    });
    it('should chunk requests for large numbers of articles into separate requests', async () => {
      const articleIds = [
        ...Array.from(Array(175).keys()).map(_ => _.toString())
      ];
      const chunkedArticleIds = chunk(articleIds, 50);
      chunkedArticleIds.map(_ =>
        fetchMock.once(
          getCapiUriForContentIds(_),
          '{"response":{ "results": [] }}'
        )
      );
      await getArticlesBatched(articleIds);
    });
  });
  describe('getArticles', () => {
    it('should return the articles and a title if provided', async () => {
      fetchMock.once(
        // Note the lack of a 'search' param!
        // CAPI will return the search results for the tag instead.
        'begin:/api/preview/exampleTag',
        JSON.stringify({
          response: { results: [], tag: { webTitle: 'Example title' } }
        })
      );
      const result = await getArticles('exampleTag');
      expect(result).toEqual({
        articles: [],
        title: 'Example title'
      });
    });
  });
});
