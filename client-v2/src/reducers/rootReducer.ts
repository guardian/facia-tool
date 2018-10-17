import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';

import shared from 'shared/reducers/sharedReducer';
import config from './configReducer';
import fronts from './frontsReducer';
import error from './errorReducer';
import path from './pathReducer';
import unpublishedChanges from './unpublishedChangesReducer';
import clipboard from './clipboardReducer';
import editor from '../bundles/frontsUIBundle';
import staleFronts from './staleFrontsReducer';

const reducers = {
  fronts,
  config,
  error,
  path,
  shared,
  unpublishedChanges,
  clipboard,
  editor,
  staleFronts,
  form
};

const rootReducer = combineReducers(reducers);

export default rootReducer;
