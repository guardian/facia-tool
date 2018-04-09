// @flow

import { type Action } from '../types/Action';

type State = { error?: string };

const error = (state: State = {}, action: Action) => {
  switch (action.type) {
    case 'CAUGHT_ERROR': {
      return action.message;
    }
    case 'CLEAR_ERROR': {
      return null;
    }
    default: {
      return state;
    }
  }
};

export default error;
