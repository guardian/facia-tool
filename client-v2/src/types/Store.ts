

import { Store as ReduxStore } from 'redux';
import { Action } from './Action';
import { State } from './State';

export Store = ReduxStore<State, Action>;
export GetState = () => State;
// eslint-disable-next-line no-use-before-define
export Dispatch = <T>(action: Action | ThunkAction) => T;
export ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
