import { createCollectionItemTypeSelector } from '../collectionItem';
import { stateWithSnaplinksAndArticles } from 'shared/fixtures/shared';
import collectionItemTypes from 'shared/constants/collectionItemTypes';

describe('CollectionItem selectors', () => {
  describe('createCollectionItemTypeSelector', () => {
    it('should identify snap links', () => {
      const selector = createCollectionItemTypeSelector();
      expect(
        selector(
          stateWithSnaplinksAndArticles.shared,
          '4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5'
        )
      ).toEqual(collectionItemTypes.SNAP_LINK);
    });
    it('should identify articles', () => {
      const selector = createCollectionItemTypeSelector();
      expect(
        selector(
          stateWithSnaplinksAndArticles.shared,
          '134c9d4f-b05c-43f4-be41-a605b6dccab9'
        )
      ).toEqual(collectionItemTypes.ARTICLE);
    });
  });
});
