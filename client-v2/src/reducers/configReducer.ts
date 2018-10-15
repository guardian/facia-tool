

import { Action } from 'types/Action';
import { Config } from 'types/Config';

type State = Config | void;

const config = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CONFIG_RECEIVED': {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

export default config;
