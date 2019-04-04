import { ApplicationFocusState } from "services/keyboard";
import { Action } from "../types/Action";
import { State as GlobalState } from "../types/State";

// Action types

export const FOCUS_SET_FOCUS_STATE = 'FOCUS_SET_FOCUS_STATE';

// Actions to add focus state

export const setFocusState = (
  focusState: ApplicationFocusState
) => ({
  type: FOCUS_SET_FOCUS_STATE as typeof FOCUS_SET_FOCUS_STATE,
  payload: { focusState }
});

// Action handlers for each of those actions

interface State {
  focusState?: ApplicationFocusState
}

export const reducer = (state: State = { focusState: undefined }, action: Action) => {
  switch (action.type) {
    case FOCUS_SET_FOCUS_STATE: {
      return {
        ...state,
        focusState: action.payload.focusState
      }
    }
    default: {
      return state;
    }
  }
};

export const selectFocusState = (state: GlobalState) => state.focus.focusState;
