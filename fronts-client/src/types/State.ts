import { FormStateMap } from 'redux-form';

import type { Config } from 'types/Config';
import type { ActionError } from 'types/Action';
import type { Card, Group } from 'types/Collection';

import { State as frontsState } from 'reducers/frontsReducer';
import { State as pathState } from 'reducers/pathReducer';
import { State as unpublishedChangesState } from 'reducers/unpublishedChangesReducer';
import { State as clipboardState } from 'reducers/clipboardReducer';
import { OptionsModalProps as OptionsModalState } from 'types/Modals';
import { State as editorState } from 'bundles/frontsUI';
import { EditionsIssueState } from 'bundles/editionsIssueBundle';
import {
	capiLiveFeed,
	capiPreviewFeed,
	prefillFeed,
} from 'bundles/capiFeedBundle';
import { State as staleFrontsState } from 'reducers/staleFrontsReducer';
import { State as feedStateType } from 'reducers/feedStateReducer';

import { reducer as collections } from 'bundles/collectionsBundle';
import { reducer as pageViewData } from 'reducers/pageViewDataReducer';
import { reducer as externalArticles } from 'bundles/externalArticlesBundle';
import { State as focusState } from 'bundles/focusBundle';
import { State as featureSwitchesState } from 'reducers/featureSwitchesReducer';
import { reducer as notificationsReducer } from 'bundles/notificationsBundle';
import { reducer } from '../bundles/chefsBundle';

interface FeedState {
	feedState: feedStateType;
	capiLiveFeed: ReturnType<typeof capiLiveFeed>;
	capiPreviewFeed: ReturnType<typeof capiPreviewFeed>;
	prefillFeed: ReturnType<typeof prefillFeed>;
}

export interface State {
	fronts: frontsState;
	config: Config | null;
	error: ActionError;
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
	notifications: ReturnType<typeof notificationsReducer>;
	chefs: ReturnType<typeof reducer>;
}
