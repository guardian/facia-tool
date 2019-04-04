import { ApplicationFocusStates } from 'keyboard';
import { Action } from '../types/Action';
import { State as GlobalState } from '../types/State';

export const FOCUS_SET_FOCUS_STATE = 'FOCUS_SET_FOCUS_STATE';

export const setFocusState = (focusState: ApplicationFocusStates) => ({
  type: FOCUS_SET_FOCUS_STATE as typeof FOCUS_SET_FOCUS_STATE,
  payload: { focusState }
});

export const selectFocusState = (state: GlobalState) => state.focus.focusState;

interface State {
  focusState?: ApplicationFocusStates;
}

export const reducer = (
  state: State = { focusState: undefined },
  action: Action
) => {
  switch (action.type) {
    case FOCUS_SET_FOCUS_STATE: {
      return {
        ...state,
        focusState: action.payload.focusState
      };
    }
    default: {
      return state;
    }
  }
};
