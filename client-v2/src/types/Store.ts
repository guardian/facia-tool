import { Store as ReduxStore, Dispatch } from 'redux';
import { Action } from './Action';
import { State } from './State';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';

export type Store = ReduxStore<State>;
export type GetState = () => State;
export type Dispatch = ThunkDispatch<State, undefined, Action>;
export type ThunkResult<R> = ThunkAction<R, State, undefined, Action>;
