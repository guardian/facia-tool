// @flow

import { combineReducers } from 'redux';
import config from './configReducer';
import frontsConfig from './frontsConfigReducer';
import error from './errorReducer';

const reducers = {
  config,
  frontsConfig,
  error
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
