import { State } from 'types/State';

export const selectIsPrefillMode = (state: State) =>
  state.feed.feedState.isPrefillMode;
