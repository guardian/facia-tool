import { Store as ReduxStore } from 'redux';
import { State } from 'types/State';
import { Action } from 'types/Action';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';

export type Store = ReduxStore<State>;
export type GetState = () => State;
export type Dispatch = ThunkDispatch<State, void, Action>;
export type ThunkResult<R> = ThunkAction<R, State, void, Action>;
