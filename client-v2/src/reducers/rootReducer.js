// @flow

import { combineReducers } from 'redux';

import shared from 'shared/reducers/sharedReducer';
import config from './configReducer';
import fronts from './frontsReducer';
import error from './errorReducer';
import path from './pathReducer';

const reducers = {
  config,
  fronts,
  error,
  path,
  shared
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
