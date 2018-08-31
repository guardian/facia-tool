// @flow

import {
  type Store as ReduxStore,
  type Dispatch as ReduxDispatch
} from 'redux';
import { type Action } from './Action';
import { type State } from './State';

// eslint-disable-next-line no-use-before-define
type ThunkDispatch = <T>(action: ThunkAction) => T;

export type Store = ReduxStore<State, Action>;
export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action> & ThunkDispatch;
export type Thunk<A> = ((Dispatch, GetState) => Promise<void> | void) => A;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
