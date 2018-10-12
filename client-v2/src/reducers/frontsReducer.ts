

import set from 'lodash/fp/set';

import { $ReturnType } from 'shared/types/Utility';
import { Action } from 'types/Action';
import {
  reducer as frontsConfigReducer,
  initialState
} from 'bundles/frontsConfigBundle';

type State = {
  frontsConfig: $ReturnType<typeof frontsConfigReducer>,
  lastPressed: {
    draft: {
      [id: string]: string
    },
    live: {
      [id: string]: string
    }
  }
};

const reducer = (
  state?: State = {
    frontsConfig: initialState,
    lastPressed: {
      draft: {},
      live: {}
    }
  },
  action: Action
): State => {
  // @todo - note the sneaky :any.
  const frontsConfig = frontsConfigReducer(state.frontsConfig, (action as any));
  let newState = state;
  if (frontsConfig !== state.frontsConfig) {
    newState = {
      ...state,
      frontsConfig
    };
  }
  switch (action.type) {
    case 'FETCH_LAST_PRESSED_SUCCESS': {
      return set(
        ['lastPressed', action.payload.frontId],
        action.payload.datePressed,
        newState
      );
    }
    default: {
      return newState;
    }
  }
};

export { State };

export default reducer;
