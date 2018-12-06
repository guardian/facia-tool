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

const rootReducer = (state: any = {}, action: any) => ({
  fronts: fronts(state.fronts, action),
  config: config(state.config, action),
  error: error(state.error, action),
  path: path(state.path, action),
  shared: shared(state.shared, action),
  unpublishedChanges: unpublishedChanges(state.unpublishedChanges, action),
  clipboard: clipboard(state.clipboard, action, state.shared),
  editor: editor(state.editor, action),
  staleFronts: staleFronts(state.staleFronts, action),
  form: form(state.form, action)
});

export default rootReducer;
