import { reducer as form } from 'redux-form';

import config from 'reducers/configReducer';
import fronts from 'reducers/frontsReducer';
import error from 'reducers/errorReducer';
import path from 'reducers/pathReducer';
import unpublishedChanges from 'reducers/unpublishedChangesReducer';
import clipboard from 'reducers/clipboardReducer';
import optionsModal from 'reducers/modalsReducer';
import editor from 'bundles/frontsUI';
import editionsIssue from 'bundles/editionsIssueBundle';
import {
	capiLiveFeed,
	capiPreviewFeed,
	prefillFeed,
} from 'bundles/capiFeedBundle';
import staleFronts from 'reducers/staleFrontsReducer';
import feedState from 'reducers/feedStateReducer';

import { reducer as collections } from 'bundles/collectionsBundle';
import { reducer as pageViewData } from 'reducers/pageViewDataReducer';
import { reducer as externalArticles } from 'bundles/externalArticlesBundle';
import cards from 'reducers/cardsReducer';
import groups from 'reducers/groupsReducer';

import { reducer as focusReducer } from 'bundles/focusBundle';
import { reducer as featureSwitches } from 'reducers/featureSwitchesReducer';
import { reducer as notificationsReducer } from 'bundles/notificationsBundle';
import { reducer as recipesReducer } from 'bundles/recipesBundle';
import { reducer as chefsReducer } from 'bundles/chefsBundle';

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
		prefillFeed: prefillFeed(state.feed.prefillFeed, action),
	},
	focus: focusReducer(state.focus, action),
	editionsIssue: editionsIssue(state.editionsIssue, action),
	featureSwitches: featureSwitches(state.featureSwitches, action),
	cards: cards(state.cards, action),
	groups: groups(state.groups, action, state),
	collections: collections(state.collections, action),
	externalArticles: externalArticles(state.externalArticles, action),
	pageViewData: pageViewData(state.pageViewData, action),
	notifications: notificationsReducer(state.notifications, action),
	recipes: recipesReducer(state.recipes, action),
	chefs: chefsReducer(state.chefs, action),
});

export default rootReducer;
