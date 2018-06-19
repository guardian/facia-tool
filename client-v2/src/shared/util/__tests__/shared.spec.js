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
      const result = normaliseCollectionWithNestedArticles(exampleCollection);
      expect(result.collection.live.length).toEqual(3);
      expect(
        result.collection.live.every(articleId => typeof articleId === 'string')
      ).toBe(true);
      expect(Object.keys(result.articleFragments).length).toEqual(3);
      expect(result.articleFragments[result.collection.live[0]].id).toBe('0');
      expect(result.articleFragments[result.collection.live[1]].id).toBe('1');
      expect(result.articleFragments[result.collection.live[2]].id).toBe('2');
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
      expect(result.collection.live.length).toEqual(3);
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
      expect(result.articleFragments[result.collection.live[0]].id).toBe('0');
      expect(result.articleFragments[result.collection.draft[0]].id).toBe('2');
      expect(result.articleFragments[result.collection.previously[0]].id).toBe(
        '3'
      );
    });
    it('should handle a collection without any articles', () => {
      const result = normaliseCollectionWithNestedArticles({
        ...collection,
        ...{ live: [] }
      });
      expect(result.collection.live.length).toEqual(0);
      expect(result.collection.draft).toHaveLength(0);
      expect(result.collection.previously).toHaveLength(0);
      expect(Object.keys(result.articleFragments)).toHaveLength(0);
    });
    it('should normalise supporting article fragments', () => {
      const result = normaliseCollectionWithNestedArticles(
        collectionWithSupportingArticles
      );
      expect(result.collection.live.length).toEqual(2);
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
