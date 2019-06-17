import { Store as ReduxStore, Dispatch } from 'redux';
import { Action } from './Action';
import { State } from './State';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';
import { FrontsConfig } from './FaciaApi';

export interface ExtraThunkArgs {
  fetchFrontsConfig: (state: State) => Promise<FrontsConfig> | null;
}

export type Store = ReduxStore<State>;
export type GetState = () => State;
export type Dispatch = ThunkDispatch<State, ExtraThunkArgs, Action>;
export type ThunkResult<R> = ThunkAction<R, State, ExtraThunkArgs, Action>;
