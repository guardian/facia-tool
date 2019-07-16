import { State } from 'types/State';

export const selectIsPrefillMode = (state: State) =>
  state.capi.feedState.isPrefillMode;
