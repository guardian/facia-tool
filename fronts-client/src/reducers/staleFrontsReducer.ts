import type { Action } from 'types/Action';

export interface State {
	[id: string]: boolean;
}

const staleFronts = (state: State = {}, action: Action): State => {
	switch (action.type) {
		case 'RECORD_STALE_FRONTS': {
			const { payload } = action;
			return { ...state, ...payload };
		}
		default: {
			return state;
		}
	}
};

export default staleFronts;
