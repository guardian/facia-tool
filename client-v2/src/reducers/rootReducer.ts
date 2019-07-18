import { reducer as form } from 'redux-form';

import shared from 'shared/reducers/sharedReducer';
import config from './configReducer';
import fronts from './frontsReducer';
import error from './errorReducer';
import path from './pathReducer';
import unpublishedChanges from './unpublishedChangesReducer';
import clipboard from './clipboardReducer';
import confirmModal from './confirmModalReducer';
import editor from '../bundles/frontsUIBundle';
import editionsIssue from '../bundles/editionsIssueBundle';
import { capiLiveFeed, capiPreviewFeed } from '../bundles/capiFeedBundle';
import staleFronts from './staleFrontsReducer';

import { reducer as focusReducer } from '../bundles/focusBundle';
import { reducer as featureSwitchesReducer } from 'redux/modules/featureSwitches';

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
  form: form(state.form, action),
  confirmModal: confirmModal(state.confirmModal, action),
  capiLiveFeed: capiLiveFeed(state.capiLiveFeed, action),
  capiPreviewFeed: capiPreviewFeed(state.capiPreviewFeed, action),
  focus: focusReducer(state.focus, action),
  editionsIssue: editionsIssue(state.editionsIssue, action),
  featureSwitches: featureSwitchesReducer(state.featureSwitches, action)
});

export default rootReducer;
