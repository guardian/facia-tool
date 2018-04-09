// @flow

import { type Action } from '../types/Action';

type State = { path?: string };

const path = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'PATH_UPDATE': {
      return action.path || state;
    }
    default: {
      return state;
    }
  }
};

export default path;
