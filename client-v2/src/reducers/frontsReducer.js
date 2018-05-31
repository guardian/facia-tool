// @flow

import set from 'lodash/fp/set';

import { type Action } from 'types/Action';
import type { FrontsConfig } from 'types/FaciaApi';

type State = {
  frontsConfig: FrontsConfig,
  lastPressed: {
    draft: {
      [id: string]: string
    },
    live: {
      [id: string]: string
    }
  }
};

const frontsConfig = (
  state?: State = {
    frontsConfig: { fronts: {}, collections: {} },
    lastPressed: {
      draft: {},
      live: {}
    }
  },
  action: Action
): State => {
  switch (action.type) {
    case 'FRONTS_CONFIG_RECEIVED': {
      return {
        ...state,
        frontsConfig: action.payload
      };
    }
    case 'FETCH_LAST_PRESSED_SUCCESS': {
      return set(
        ['lastPressed', action.payload.frontId],
        action.payload.datePressed,
        state
      );
    }
    default: {
      return state;
    }
  }
};

export default frontsConfig;
