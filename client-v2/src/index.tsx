import 'babel-polyfill';
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
  editorSetFavouriteFronts
} from 'bundles/frontsUIBundle';
import { storeClipboardContent } from 'actions/Clipboard';
import { Dispatch } from 'types/Store';
import Modal from 'react-modal';
import { init as initGA } from 'services/GA';
import init from 'services/keyboard';
import pollingConfig from 'util/pollingConfig';
import { base } from 'constants/routes';

initGA();

const store = configureStore();

// publish uncaught errors to sentry.io
if (pageConfig.env.toUpperCase() !== 'DEV' && pageConfig.sentryPublicDSN) {
  const sentryOptions = {
    tags: {
      stack: 'cms-fronts',
      stage: pageConfig.env.toUpperCase(),
      app: 'facia-tool-v2'
    }
  };

  Raven.config(pageConfig.sentryPublicDSN, sentryOptions).install();
}

store.dispatch(configReceived(pageConfig));
if (pageConfig.frontIdsByPriority) {
  store.dispatch(editorSetOpenFronts(pageConfig.frontIdsByPriority));
}
if (pageConfig.favouriteFrontIdsByPriority) {
  store.dispatch(
    editorSetFavouriteFronts(pageConfig.favouriteFrontIdsByPriority)
  );
}

(store.dispatch as Dispatch)(
  storeClipboardContent(pageConfig.clipboardArticles)
);

// @ts-ignore unbind is not used yet but can be used for removed all the
// keyboard events
const unbind = init(store);

if (process.env.BUILD_ENV !== 'integration') {
  pollingConfig(store);
}

const reactMount = document.getElementById('react-mount');

if (reactMount) {
  Modal.setAppElement(reactMount);
  render(
    <Provider store={store}>
      <BrowserRouter basename={base}>
        <App />
      </BrowserRouter>
    </Provider>,
    reactMount
  );
}
