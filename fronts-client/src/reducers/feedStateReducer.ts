import type { Action } from 'types/Action';

interface State {
	isPrefillMode: boolean;
}

const feedState = (
	state: State = {
		isPrefillMode: false,
	},
	action: Action,
) => {
	switch (action.type) {
		case 'FEED_STATE_IS_PREFILL_MODE': {
			return {
				isPrefillMode: action.payload.isPrefillMode,
			};
		}
		default: {
			return state;
		}
	}
};

export { State };
export default feedState;
