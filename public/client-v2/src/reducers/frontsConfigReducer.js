// @flow

import { type Action } from '../types/Action';

type State = Object;

const frontsConfig = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'FRONTS_CONFIG_RECEIVED': {
      return action.payload;
    }
    default: {
      return state;
    }
  }
};

export default frontsConfig;
