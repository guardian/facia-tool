// @flow

import { type Store as ReduxStore } from 'redux';
import { type Action } from './Action';
import { type State } from './State';

export type Store = ReduxStore<State, Action>;
export type GetState = () => State;
// eslint-disable-next-line no-use-before-define
export type Dispatch = <T>(action: Action | ThunkAction) => T;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
