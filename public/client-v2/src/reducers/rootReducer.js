// @flow

import { combineReducers } from 'redux';
import config from './configReducer';
import frontsConfig from './frontsConfigReducer';

const reducers = {
  config,
  frontsConfig
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
