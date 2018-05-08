// @flow

import { type Action } from 'Types/Action';
import { type FrontsConfig } from 'Types/FrontsConfig';

type State = FrontsConfig;

const frontsConfig = (
  state: State = { fronts: {}, collections: {} },
  action: Action
) => {
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
