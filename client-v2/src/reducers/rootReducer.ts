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
import {
  capiLiveFeed,
  capiPreviewFeed,
  prefillFeed
} from '../bundles/capiFeedBundle';
import staleFronts from './staleFrontsReducer';
import feedState from './feedStateReducer';

import { reducer as focusReducer } from '../bundles/focusBundle';
import { reducer as featureSwitchesReducer } from 'redux/modules/featureSwitches';

const rootReducer = (state: any = { capi: {} }, action: any) => ({
  fronts: fronts(state.fronts, action),
  config: config(state.config, action),
  error: error(state.error, action),
  path: path(state.path, action),
  shared: shared(state.shared, action),
  unpublishedChanges: unpublishedChanges(state.unpublishedChanges, action),
  clipboard: clipboard(state.clipboard, action, state.shared),
  editor: editor(state.editor, action, state.shared),
  staleFronts: staleFronts(state.staleFronts, action),
  form: form(state.form, action),
  confirmModal: confirmModal(state.confirmModal, action),
  capi: {
    feedState: feedState(state.capi.feedState, action),
    capiLiveFeed: capiLiveFeed(state.capi.capiLiveFeed, action),
    capiPreviewFeed: capiPreviewFeed(state.capi.capiPreviewFeed, action),
    prefillFeed: prefillFeed(state.capi.prefillFeed, action)
  },
  focus: focusReducer(state.focus, action),
  editionsIssue: editionsIssue(state.editionsIssue, action),
  featureSwitches: featureSwitchesReducer(state.featureSwitches, action)
});

export default rootReducer;
