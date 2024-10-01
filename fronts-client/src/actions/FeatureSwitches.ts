import { FeatureSwitch } from 'types/Features';

export const SET_FEATURE_VALUE = 'SET_FEATURE_VALUE';

export const actionSetFeatureValue = (featureSwitch: FeatureSwitch) => ({
	type: SET_FEATURE_VALUE as typeof SET_FEATURE_VALUE,
	payload: { featureSwitch },
});

export type ActionSetFeatureValue = ReturnType<typeof actionSetFeatureValue>;
