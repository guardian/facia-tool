// @flow

import { type Action } from '../types/Action';

type State = Object;

const config = (state: State = {}, action: Action) => {
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
