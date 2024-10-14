import { selectAllFeatures } from '../featureSwitchesSelectors';
import { state as initialState } from 'fixtures/initialState';
import type { State } from 'types/State';

describe('Feature selectors', () => {
	describe('selectAllFeatures', () => {
		it('should select all features', () => {
			const featureSwitches = {
				exampleFeature1: {
					key: 'exampleFeature1',
					title: 'Title',
					enabled: false,
				},
				exampleFeature2: {
					key: 'exampleFeature2',
					title: 'Title',
					enabled: false,
				},
			};
			const state = {
				...initialState,
				featureSwitches,
			} as State;
			expect(selectAllFeatures(state)).toEqual([
				featureSwitches.exampleFeature1,
				featureSwitches.exampleFeature2,
			]);
		});
		it('should be memoised', () => {
			expect(selectAllFeatures(initialState)).toBe(
				selectAllFeatures(initialState),
			);
		});
	});
});
