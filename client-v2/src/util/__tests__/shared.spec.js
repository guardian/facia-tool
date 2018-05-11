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
    }
  ],
  id: 'exampleCollection',
  displayName: 'Example Collection'
};

describe('Shared utilities', () => {
  describe('normaliseCollectionWithNestedArticles', () => {
    it('should normalise an external collection, and provide the new collection and article fragments indexed by id', () => {
      const result = normaliseCollectionWithNestedArticles(exampleCollection);
      expect(result.collection.articles.live.length).toEqual(2);
      expect(
        result.collection.articles.live.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(2);
      expect(
        result.articleFragments[result.collection.articles.live[0]].id
      ).toBe('article/live/0');
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
      expect(result.collection.articles.live.length).toEqual(2);
      expect(result.collection.articles.draft.length).toEqual(1);
      expect(result.collection.articles.previously.length).toEqual(1);
      expect(
        result.collection.articles.live.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(
        result.collection.articles.draft.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(
        result.collection.articles.previously.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(4);
      expect(
        result.articleFragments[result.collection.articles.live[0]].id
      ).toBe('article/live/0');
      expect(
        result.articleFragments[result.collection.articles.draft[0]].id
      ).toBe('article/live/2');
      expect(
        result.articleFragments[result.collection.articles.previously[0]].id
      ).toBe('article/live/3');
    });
    it('should handle a collection without any articles', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...exampleCollection,
        ...{ live: [] }
      });
      expect(result.collection.articles.live.length).toEqual(0);
      expect(result.collection.articles.draft).toBeUndefined();
      expect(result.collection.articles.previously).toBeUndefined();
      expect(Object.keys(result.articleFragments).length).toEqual(0);
    });
  });
});
