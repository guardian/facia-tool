// @flow

import { combineReducers } from 'redux';

import shared from 'shared/reducers/sharedReducer';
import config from './configReducer';
import fronts from './frontsReducer';
import error from './errorReducer';
import path from './pathReducer';
import unpublishedChanges from './unpublishedChangesReducer';
import clipboard from './clipboardReducer';
import staleFronts from './staleFrontsReducer';

const reducers = {
  config,
  fronts,
  error,
  path,
  shared,
  unpublishedChanges,
  clipboard,
  staleFronts
};

export type Reducers = typeof reducers;

export default combineReducers(reducers);
