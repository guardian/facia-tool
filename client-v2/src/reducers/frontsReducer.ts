import set from 'lodash/fp/set';

import { Action } from 'types/Action';
import {
  reducer as frontsConfigReducer,
  initialState,
  FrontsConfigState
} from 'bundles/frontsConfigBundle';

interface State {
  frontsConfig: FrontsConfigState;
  lastPressed: {
    [id: string]: string;
  };
}

const reducer = (
  state: State = {
    frontsConfig: initialState,
    lastPressed: {}
  },
  action: Action
): State => {
  // @todo - note the sneaky :any.
  const frontsConfig = frontsConfigReducer(state.frontsConfig, action as any);
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
