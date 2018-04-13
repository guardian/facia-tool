// @flow

import { combineReducers } from 'redux';
import config from './configReducer';
import frontsConfig from './frontsConfigReducer';
import error from './errorReducer';
import path from './pathReducer';
import collections from './collectionsReducer';

const reducers = {
  config,
  frontsConfig,
  error,
  path,
  collections
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
