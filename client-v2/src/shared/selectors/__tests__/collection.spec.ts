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
      // expect(selectArticlesInCollections(stateWithCollection, {
      //   collectionIds: ['id', 'id'],
      //   itemSet: 'draft'
      // })).toEqual([])
    });
  });
});
