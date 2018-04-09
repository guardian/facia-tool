// @flow

import { combineReducers } from 'redux';
import config from './configReducer';
import frontsConfig from './frontsConfigReducer';
import error from './errorReducer';
import path from './pathReducer';

const reducers = {
  config,
  frontsConfig,
  error,
  path
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
