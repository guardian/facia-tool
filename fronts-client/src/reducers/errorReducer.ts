import type { Action } from 'types/Action';
import { ActionError } from 'types/Action';

type State = ActionError;

const error = (state: State = '', action: Action) => {
	switch (action.type) {
		case 'CAUGHT_ERROR': {
			return action.message;
		}
		case 'CLEAR_ERROR': {
			return '';
		}
		default: {
			return state;
		}
	}
};

export default error;
