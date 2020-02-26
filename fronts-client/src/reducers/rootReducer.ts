import { reducer as form, FormStateMap } from 'redux-form';
import config from './configReducer';
import fronts, { State as frontsState } from './frontsReducer';
import error from './errorReducer';
import path, { State as pathState } from './pathReducer';
import unpublishedChanges, {
  State as unpublishedChangesState
} from './unpublishedChangesReducer';
import clipboard, { State as clipboardState } from './clipboardReducer';
import optionsModal from 'reducers/modalsReducer';
import { OptionsModalProps as OptionsModalState } from 'types/Modals';
import editor, { State as editorState } from '../bundles/frontsUIBundle';
import editionsIssue, {
  EditionsIssueState
} from '../bundles/editionsIssueBundle';
import {
  capiLiveFeed,
  capiPreviewFeed,
  prefillFeed
} from '../bundles/capiFeedBundle';
import staleFronts, { State as staleFrontsState } from './staleFrontsReducer';
import feedState, { State as feedStateType } from './feedStateReducer';

import { reducer as collections } from '../bundles/collectionsBundle';
import { reducer as pageViewData } from '../redux/modules/pageViewData';
import { reducer as externalArticles } from '../bundles/externalArticlesBundle';
import cards from 'reducers/cardsReducer';
import groups from 'reducers/groupsReducer';

import {
  reducer as focusReducer,
  State as focusState
} from '../bundles/focusBundle';
import {
  reducer as featureSwitches,
  State as featureSwitchesState
} from 'redux/modules/featureSwitches';

import { Config } from 'types/Config';
import { ActionError } from 'types/Action';
import { Card, Group } from 'types/Collection';

interface FeedState {
  feedState: feedStateType;
  capiLiveFeed: ReturnType<typeof capiLiveFeed>;
  capiPreviewFeed: ReturnType<typeof capiPreviewFeed>;
  prefillFeed: ReturnType<typeof prefillFeed>;
}

export interface State {
  fronts: frontsState;
  config: Config | null;
  error: ActionError | null;
  path: pathState;
  unpublishedChanges: unpublishedChangesState;
  clipboard: clipboardState;
  editor: editorState;
  staleFronts: staleFrontsState;
  form: FormStateMap;
  optionsModal: OptionsModalState | null;
  feed: FeedState;
  focus: focusState;
  editionsIssue: EditionsIssueState;
  featureSwitches: featureSwitchesState;
  cards: {
    [uuid: string]: Card;
  };
  groups: {
    [id: string]: Group;
  };
  collections: ReturnType<typeof collections>;
  externalArticles: ReturnType<typeof externalArticles>;
  pageViewData: ReturnType<typeof pageViewData>;
}

const rootReducer = (state: any = { feed: {} }, action: any) => ({
  fronts: fronts(state.fronts, action),
  config: config(state.config, action),
  error: error(state.error, action),
  path: path(state.path, action),
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
  featureSwitches: featureSwitches(state.featureSwitches, action),
  cards: cards(state.cards, action),
  groups: groups(state.groups, action, state),
  collections: collections(state.collections, action),
  externalArticles: externalArticles(state.externalArticles, action),
  pageViewData: pageViewData(state.pageViewData, action)
});

export default rootReducer;
