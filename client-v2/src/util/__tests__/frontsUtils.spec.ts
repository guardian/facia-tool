import { getVisibilityStoryDetails } from '../frontsUtils';
import { boostedArticleFragment, articleFragmentWithElementsThumbnail } from 'fixtures/articleFragment';

describe('Front utilities', () => {
  describe('getVisibilityStoryDetails', () => {
    it('summarise stories correctly according to group ', () => {
      const groups = [];
      const result = getVisibilityStoryDetails([[boostedArticleFragment], [articleFragmentWithElementsThumbnail, articleFragmentWithElementsThumbnail]]);
      expect(result[0]).toEqual({group: 1, isBoosted: true});
      expect(result[1]).toEqual({group: 0, isBoosted: false});
      expect(result[2]).toEqual({group: 0, isBoosted: false});
    });
  });
});

