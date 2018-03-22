// @flow

import { combineReducers } from 'redux';
import config from './configReducer';

const reducers = {
  config
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
