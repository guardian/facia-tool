import type { State } from 'types/State';
import { createSelector } from 'reselect';

export const selectFeatureValue = (
	state: State,
	featureKey: string,
): boolean =>
	state.featureSwitches[featureKey]
		? state.featureSwitches[featureKey].enabled
		: false;

const selectFeatures = (state: State) => state.featureSwitches;

export const selectAllFeatures = createSelector(selectFeatures, (features) =>
	Object.values(features),
);
