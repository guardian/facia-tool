import { ApplicationFocusStates } from 'keyboard';
import { Action } from '../types/Action';
import { State as GlobalState } from '../types/State';

export const FOCUS_SET_FOCUS_STATE = 'FOCUS_SET_FOCUS_STATE';
export const FOCUS_RESET_FOCUS_STATE = 'FOCUS_RESET_FOCUS_STATE';

export const setFocusState = (focusState: ApplicationFocusStates) => ({
  type: FOCUS_SET_FOCUS_STATE as typeof FOCUS_SET_FOCUS_STATE,
  payload: { focusState }
});

export const resetFocusState = () => ({
  type: FOCUS_RESET_FOCUS_STATE as typeof FOCUS_RESET_FOCUS_STATE
});

export const selectFocusState = (state: GlobalState) => state.focus.focusState;

export const selectIsClipboardFocused = (state: GlobalState) => {
  const focusState = selectFocusState(state);
  if (focusState) {
    return focusState.type === 'clipboard';
  }
  return false;
};

export const selectFocusedArticle = (state: GlobalState, focusType: string) => {
  const focusState = selectFocusState(state);
  if (focusState && focusState.type === focusType) {
    return focusState.articleFragment && focusState.articleFragment.uuid;
  }
};

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
    case FOCUS_RESET_FOCUS_STATE: {
      return {
        focusState: undefined
      };
    }
  }
};
