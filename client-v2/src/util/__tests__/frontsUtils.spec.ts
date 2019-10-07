import { getVisibilityArticleDetails } from '../frontsUtils';
import {
  boostedCard,
  card
} from 'fixtures/card';

describe('Front utilities', () => {
  describe('getVisibilityArticleDetails', () => {
    it('summarise articles correctly according to group ', () => {
      const result = getVisibilityArticleDetails([
        [boostedCard],
        [card, card]
      ]);
      expect(result[0]).toEqual({ group: 1, isBoosted: true });
      expect(result[1]).toEqual({ group: 0, isBoosted: false });
      expect(result[2]).toEqual({ group: 0, isBoosted: false });
    });
  });
});
