// @flow

import { normaliseCollectionWithNestedArticles } from '../shared';

const exampleCollection = {
  live: [
    {
      id: 'article/live/0',
      frontPublicationDate: 1,
      publishedBy: 'Computers',
      meta: {}
    },
    {
      id: 'article/draft/1',
      frontPublicationDate: 2,
      publishedBy: 'Computers',
      meta: {}
    },
    {
      id: 'a/long/path/2',
      frontPublicationDate: 2,
      publishedBy: 'Computers',
      meta: {}
    }
  ],
  id: 'exampleCollection',
  displayName: 'Example Collection'
};

describe('Shared utilities', () => {
  describe('normaliseCollectionWithNestedArticles', () => {
    it('should normalise an external collection, and provide the new collection and article fragments indexed by id', () => {
      const result = normaliseCollectionWithNestedArticles(exampleCollection);
      expect(result.collection.articleFragments.live.length).toEqual(3);
      expect(
        result.collection.articleFragments.live.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(3);
      expect(
        result.articleFragments[result.collection.articleFragments.live[0]].id
      ).toBe('0');
      expect(
        result.articleFragments[result.collection.articleFragments.live[1]].id
      ).toBe('1');
      expect(
        result.articleFragments[result.collection.articleFragments.live[2]].id
      ).toBe('2');
    });
    it('should handle draft and previously keys', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...exampleCollection,
        ...{
          draft: [
            {
              id: 'article/live/2',
              frontPublicationDate: 3,
              publishedBy: 'Computers',
              meta: {}
            }
          ],
          previously: [
            {
              id: 'article/live/3',
              frontPublicationDate: 4,
              publishedBy: 'Computers',
              meta: {}
            }
          ]
        }
      });
      expect(result.collection.articleFragments.live.length).toEqual(3);
      expect(result.collection.articleFragments.draft.length).toEqual(1);
      expect(result.collection.articleFragments.previously.length).toEqual(1);
      expect(
        result.collection.articleFragments.live.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(
        result.collection.articleFragments.draft.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(
        result.collection.articleFragments.previously.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(5);
      expect(
        result.articleFragments[result.collection.articleFragments.live[0]].id
      ).toBe('0');
      expect(
        result.articleFragments[result.collection.articleFragments.draft[0]].id
      ).toBe('2');
      expect(
        result.articleFragments[
          result.collection.articleFragments.previously[0]
        ].id
      ).toBe('3');
    });
    it('should handle a collection without any articles', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...exampleCollection,
        ...{ live: [] }
      });
      expect(result.collection.articleFragments.live.length).toEqual(0);
      expect(result.collection.articleFragments.draft).toBeUndefined();
      expect(result.collection.articleFragments.previously).toBeUndefined();
      expect(Object.keys(result.articleFragments).length).toEqual(0);
    });
  });
});
