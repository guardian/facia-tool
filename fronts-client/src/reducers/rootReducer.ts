import { reducer as form, FormState } from 'redux-form';

import shared, { SharedState } from 'reducers/sharedReducer';
import config from './configReducer';
import fronts, {State as frontsState} from './frontsReducer';
import error from './errorReducer';
import path, { State as pathState} from './pathReducer';
import unpublishedChanges, { State as unpublishedChangesState} from './unpublishedChangesReducer';
import clipboard, {State as clipboardState } from './clipboardReducer';
import optionsModal, {OptionsModalState} from './modalsReducer';
import editor, {State as editorState} from '../bundles/frontsUIBundle';
import editionsIssue, {EditionsIssueState} from '../bundles/editionsIssueBundle';
import {
  capiLiveFeed,
  capiPreviewFeed,
  prefillFeed
} from '../bundles/capiFeedBundle';
import staleFronts, {State as staleFrontsState} from './staleFrontsReducer';
import feedState, {State as feedStateType} from './feedStateReducer';

import { reducer as focusReducer, State as focusState } from '../bundles/focusBundle';
import { reducer as featureSwitchesReducer, State as featureSwitchesState } from 'redux/modules/featureSwitches';

import { Config } from 'types/Config';
import { ActionError } from 'types/Action';

interface FeedState {
  feedState: feedStateType,
  capiLiveFeed: ReturnType<typeof capiLiveFeed>,
  capiPreviewFeed: ReturnType<typeof capiPreviewFeed>
  prefillFeed: ReturnType<typeof prefillFeed>
}

export interface State {
  fronts: frontsState,
  config: Config | null,
  error: ActionError,
  path: pathState,
  shared: SharedState,
  unpublishedChanges: unpublishedChangesState,
  clipboard: clipboardState,
  editor: editorState,
  staleFronts: staleFrontsState,
  form: FormState | null,
  optionsModal: OptionsModalState,
  feed: FeedState;
  focus: focusState,
  editionsIssue: EditionsIssueState,
  featureSwitches: featureSwitchesState
};


const rootReducer = (state: any = { feed: {} }, action: any) => ({
  fronts: fronts(state.fronts, action),
  config: config(state.config, action),
  error: error(state.error, action),
  path: path(state.path, action),
  shared: shared(state.shared, action),
  unpublishedChanges: unpublishedChanges(state.unpublishedChanges, action),
  clipboard: clipboard(state.clipboard, action),
  editor: editor(state.editor, action),
  staleFronts: staleFronts(state.staleFronts, action),
  form: form(state.form, action),
  optionsModal: optionsModal(state.optionsModal, action),
  feed: {
    feedState: feedState(state.feed.feedState, action),
    capiLiveFeed: capiLiveFeed(state.feed.capiLiveFeed, action),
    capiPreviewFeed: capiPreviewFeed(state.feed.capiPreviewFeed, action),
    prefillFeed: prefillFeed(state.feed.prefillFeed, action)
  },
  focus: focusReducer(state.focus, action),
  editionsIssue: editionsIssue(state.editionsIssue, action),
  featureSwitches: featureSwitchesReducer(state.featureSwitches, action)
});

export default rootReducer;
