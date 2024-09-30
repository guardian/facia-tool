import type { Action } from 'types/Action';
import { SET_FEATURE_VALUE } from '../actions/FeatureSwitches';
import { FeatureSwitch } from 'types/Features';

export interface State {
	[key: string]: FeatureSwitch;
}

const initialState = {} as State;

export const reducer = (state: State = initialState, action: Action): State => {
	switch (action.type) {
		case SET_FEATURE_VALUE: {
			return {
				...state,
				[action.payload.featureSwitch.key]: action.payload.featureSwitch,
			};
		}
	}
	return state;
};
