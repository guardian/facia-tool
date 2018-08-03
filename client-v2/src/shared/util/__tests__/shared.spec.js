// @flow

import {
  collection,
  collectionWithSupportingArticles,
  stateWithCollection,
  stateWithCollectionAndSupporting
} from 'shared/fixtures/shared';
import {
  normaliseCollectionWithNestedArticles,
  denormaliseCollection
} from '../shared';

describe('Shared utilities', () => {
  describe('denormaliseCollection', () => {
    it('should denormalise a collection from the application state', () => {
      expect(
        denormaliseCollection((stateWithCollection: any), 'exampleCollection')
      ).toEqual({
        ...collection,
        // We re-add a blank draft value here. (We could keep it undefined, it just feels a little odd!)
        draft: [],
        previously: []
      });
      expect(
        denormaliseCollection(
          (stateWithCollectionAndSupporting: any),
          'exampleCollection'
        )
      ).toEqual({
        ...collectionWithSupportingArticles,
        draft: [],
        previously: []
      });
    });
  });
  describe('normaliseCollectionWithNestedArticles', () => {
    it('should normalise an external collection, and provide the new collection and article fragments indexed by id', () => {
      const result = normaliseCollectionWithNestedArticles(collection);
      expect(result.collection.live).toHaveLength(1);
      const groupId = result.collection.live[0];
      const liveArticles = result.groups[groupId].articleFragments;
      expect(liveArticles).toHaveLength(3);
      expect(result.articleFragments[liveArticles[0]].id).toBe(
        'article/live/0'
      );
      expect(result.articleFragments[liveArticles[1]].id).toBe(
        'article/draft/1'
      );
      expect(result.articleFragments[liveArticles[2]].id).toBe('a/long/path/2');
    });
    it('should handle draft and previously keys', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...collection,
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
      expect(result.collection.live.length).toEqual(1);
      expect(result.collection.draft.length).toEqual(1);
      expect(result.collection.previously.length).toEqual(1);
      expect(
        result.collection.live.every(articleId => typeof articleId === 'string')
      ).toBe(true);
      expect(
        result.collection.draft.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(
        result.collection.previously.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(5);
      const liveGroup = result.groups[result.collection.live[0]];
      const draftGroup = result.groups[result.collection.draft[0]];
      const prevGroup = result.groups[result.collection.previously[0]];
      expect(result.articleFragments[liveGroup.articleFragments[0]].id).toBe(
        'article/live/0'
      );
      expect(result.articleFragments[draftGroup.articleFragments[0]].id).toBe(
        'article/live/2'
      );
      expect(result.articleFragments[prevGroup.articleFragments[0]].id).toBe(
        'article/live/3'
      );
    });
    it('should handle a collection without any articles', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...collection,
        ...{ live: [] }
      });
      expect(result.collection.live).toHaveLength(0);
      expect(result.collection.draft).toHaveLength(0);
      expect(result.collection.previously).toHaveLength(0);
      expect(Object.keys(result.articleFragments)).toHaveLength(0);
    });
    it('should normalise supporting article fragments', () => {
      const result = normaliseCollectionWithNestedArticles(
        collectionWithSupportingArticles
      );
      expect(result.collection.live.length).toEqual(1);
      expect(Object.keys(result.articleFragments).length).toEqual(4);
      expect(
        Object.keys(result.articleFragments).every(
          articleId =>
            !result.articleFragments[articleId].supporting ||
            result.articleFragments[articleId].supporting.map(
              id => typeof id === 'string'
            )
        )
      ).toBe(true);
    });
  });
});
