import { selectAllFeatures } from '../selectors';
import { initialState } from 'shared/fixtures/shared';
import { State } from 'shared/types/State';
import { selectSharedState } from 'shared/selectors/shared';

describe('Feature selectors', () => {
  describe('selectAllFeatures', () => {
    it('should select all features', () => {
      const featureSwitches = {
        exampleFeature1: {
          key: 'exampleFeature1',
          title: 'Title',
          enabled: false
        },
        exampleFeature2: {
          key: 'exampleFeature2',
          title: 'Title',
          enabled: false
        }
      };
      const state = {
        ...initialState,
        featureSwitches
      } as State;
      expect(selectAllFeatures(selectSharedState(state))).toEqual([
        featureSwitches.exampleFeature1,
        featureSwitches.exampleFeature2
      ]);
    });
    it('should be memoised', () => {
      expect(selectAllFeatures(initialState)).toBe(
        selectAllFeatures(initialState)
      );
    });
  });
});
