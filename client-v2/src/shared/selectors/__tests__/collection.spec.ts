import { selectArticlesInCollections } from '../collection';
import { stateWithCollection } from '../../fixtures/shared';

describe('Collection selectors', () => {
  describe('selectArticlesInCollections', () => {
    it("should select all of the articles in a given collection's itemSet", () => {
      expect(
        selectArticlesInCollections(stateWithCollection.shared, {
          collectionIds: ['exampleCollection'],
          itemSet: 'live'
        })
      ).toEqual(['article/live/0', 'article/draft/1', 'a/long/path/2']);
      expect(
        selectArticlesInCollections(stateWithCollection.shared, {
          collectionIds: ['exampleCollectionTwo'],
          itemSet: 'live'
        })
      ).toEqual(['article/live/0']);
      expect(
        selectArticlesInCollections(stateWithCollection.shared, {
          collectionIds: ['exampleCollectionTwo'],
          itemSet: 'draft'
        })
      ).toEqual(["article/draft/1", "a/long/path/2"]);
    });
    it('should return an empty array if no collections are found', () => {
      expect(
        selectArticlesInCollections(stateWithCollection.shared, {
          collectionIds: ['invalidCollectionId'],
          itemSet: 'draft'
        })
      ).toEqual([]);
    });
  });
});
