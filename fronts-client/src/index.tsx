// For development mode with Vite
import 'vite/modulepreload-polyfill';

import './util/tti';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'util/configureStore';
import pageConfig from 'util/extractConfigFromPage';
import App from 'components/App';
import { configReceived } from 'actions/Config';
import {
	editorSetOpenFronts,
	editorSetFavouriteFronts,
} from 'bundles/frontsUI';
import { storeClipboardContent } from 'actions/ClipboardThunks';
import { Dispatch } from 'types/Store';
import Modal from 'react-modal';
import { init as initGA } from 'services/GA';
import { listenForKeyboardEvents } from 'keyboard';
import pollingConfig from 'util/pollingConfig';
import { base } from 'routes/routes';
import { actionSetFeatureValue } from 'actions/FeatureSwitches';
import { deleteIssue } from 'util/delete';
import notifications from 'services/notifications';
import { actionAddNotificationBanner } from 'bundles/notificationsBundle';

initGA();

const store = configureStore();

// Wire up our notifications service
notifications.subscribe((notification) =>
	store.dispatch(actionAddNotificationBanner(notification)),
);

// @ts-ignore -- Unbind is not used yet but can be used for removed all the
// keyboard events. The keyboardActionMap contains a list of all active keyboard
// shortcuts, which can eventually be displayed to the user.
const { unbind, keyboardActionMap } = listenForKeyboardEvents(store);

// Publish uncaught errors to sentry.io
if (pageConfig.env.toUpperCase() !== 'DEV' && pageConfig.sentryPublicDSN) {
	const sentryOptions = {
		tags: {
			stack: 'cms-fronts',
			stage: pageConfig.env.toUpperCase(),
			app: 'facia-tool-v2',
		},
	};

	Raven.config(pageConfig.sentryPublicDSN, sentryOptions).install();
}

store.dispatch(configReceived(pageConfig));
if (pageConfig.userData) {
	if (pageConfig.userData.frontIdsByPriority) {
		store.dispatch(editorSetOpenFronts(pageConfig.userData.frontIdsByPriority));
	}
	if (pageConfig.userData.favouriteFrontIdsByPriority) {
		store.dispatch(
			editorSetFavouriteFronts(pageConfig.userData.favouriteFrontIdsByPriority),
		);
	}
	if (pageConfig.userData.featureSwitches) {
		pageConfig.userData.featureSwitches.forEach((featureSwitch) =>
			store.dispatch(actionSetFeatureValue(featureSwitch)),
		);
	}

	(store.dispatch as Dispatch)(
		storeClipboardContent(pageConfig.userData.clipboardArticles),
	);
}

pollingConfig(store);

const reactMount = document.getElementById('react-mount');

if (reactMount) {
	Modal.setAppElement(reactMount);
	render(
		<Provider store={store}>
			<BrowserRouter basename={base}>
				<App />
			</BrowserRouter>
		</Provider>,
		reactMount,
	);
}
(window as any).deleteIssue = deleteIssue;
