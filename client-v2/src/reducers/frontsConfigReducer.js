// @flow

import { type Action } from 'types/Action';
import { type FrontsConfig } from 'services/faciaApi';

type State = FrontsConfig;

const frontsConfig = (
  state: State = { fronts: {}, collections: {} },
  action: Action
): FrontsConfig => {
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
