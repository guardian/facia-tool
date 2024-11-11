import type { Action } from 'types/Action';
import { Config } from 'types/Config';

type State = Config | null;

const config = (state: State = null, action: Action) => {
	switch (action.type) {
		case 'CONFIG_RECEIVED': {
			return action.payload as State;
		}
		default: {
			return state;
		}
	}
};

export default config;
