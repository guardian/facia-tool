import { selectAllFeatures } from '../selectors';
import initialState from 'fixtures/initialState';

describe('Feature selectors', () => {
  describe('selectAllFeatures', () => {
    it('should select all features', () => {
      const state = {
        ...initialState,
        features: {
          exampleFeature1: true,
          exampleFeature2: false
        }
      };
      expect(selectAllFeatures(state)).toEqual([
        'exampleFeature1',
        'exampleFeature2'
      ]);
    });
    it('should be memoised', () => {
      expect(selectAllFeatures(initialState)).toBe(
        selectAllFeatures(initialState)
      );
    });
  });
});
