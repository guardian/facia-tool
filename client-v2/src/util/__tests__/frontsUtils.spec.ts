import { getVisibilityArticleDetails } from '../frontsUtils';
import {
  boostedArticleFragment,
  articleFragment
} from 'fixtures/articleFragment';

describe('Front utilities', () => {
  describe('getVisibilityArticleDetails', () => {
    it('summarise articles correctly according to group ', () => {
<<<<<<< HEAD
      const groups = [];
      const result = getVisibilityArticleDetails([
        [boostedArticleFragment],
        [articleFragment, articleFragment]
      ]);
      expect(result[0]).toEqual({ group: 1, isBoosted: true });
      expect(result[1]).toEqual({ group: 0, isBoosted: false });
      expect(result[2]).toEqual({ group: 0, isBoosted: false });
=======
      const result = getVisibilityArticleDetails([[boostedArticleFragment], [articleFragment, articleFragment]]);
      expect(result[0]).toEqual({group: 1, isBoosted: true});
      expect(result[1]).toEqual({group: 0, isBoosted: false});
      expect(result[2]).toEqual({group: 0, isBoosted: false});
>>>>>>> Bang, and the unused stuff is gone
    });
  });
});
