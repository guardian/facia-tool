// @flow

import { omit } from 'lodash';

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
        ...omit(collection, 'id'),
        // We re-add a blank draft value here. (We could keep it undefined, it just feels a little odd!)
        draft: []
      });
      expect(
        denormaliseCollection(
          (stateWithCollectionAndSupporting: any),
          'exampleCollection'
        )
      ).toEqual({
        ...omit(collectionWithSupportingArticles, 'id'),
        draft: []
      });
    });
  });
  describe('normaliseCollectionWithNestedArticles', () => {
    it('should normalise an external collection, and provide the new collection and article fragments indexed by id', () => {
      const result = normaliseCollectionWithNestedArticles(collection);
      expect(result.collection.articleFragments.live.length).toEqual(3);
      expect(
        result.collection.articleFragments.live.every(
          articleId => typeof articleId === 'string'
        )
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(3);
      expect(
        result.articleFragments[result.collection.articleFragments.live[0]].id
      ).toBe('article/live/0');
      expect(
        result.articleFragments[result.collection.articleFragments.live[1]].id
      ).toBe('article/draft/1');
      expect(
        result.articleFragments[result.collection.articleFragments.live[2]].id
      ).toBe('a/long/path/2');
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
      ).toBe('article/live/0');
      expect(
        result.articleFragments[result.collection.articleFragments.draft[0]].id
      ).toBe('article/live/2');
      expect(
        result.articleFragments[
          result.collection.articleFragments.previously[0]
        ].id
      ).toBe('article/live/3');
    });
    it('should handle a collection without any articles', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...collection,
        ...{ live: [] }
      });
      expect(result.collection.articleFragments.live.length).toEqual(0);
      expect(result.collection.articleFragments.draft).toBeUndefined();
      expect(result.collection.articleFragments.previously).toBeUndefined();
      expect(Object.keys(result.articleFragments).length).toEqual(0);
    });
    it('should normalise supporting article fragments', () => {
      const result = normaliseCollectionWithNestedArticles(
        collectionWithSupportingArticles
      );
      expect(result.collection.articleFragments.live.length).toEqual(2);
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
