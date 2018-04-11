// @flow

import { createSelector } from 'reselect';
import { type State } from '../types/State';

const configSelector = (state: State) => state.config;

const capiLiveURLSelector = createSelector(
  configSelector,
  config => (config.capiLiveUrl: string)
);

export { capiLiveURLSelector };
