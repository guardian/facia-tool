import { Store as ReduxStore } from 'redux';
import { Action } from './Action';
import { State } from './State';

export type Store = ReduxStore<State, Action>;
export type  GetState = () => State;
export type Dispatch = <T>(action: Action | ThunkAction) => T;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
