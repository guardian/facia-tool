import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'util/configureStore';
import extractConfigFromPage from 'util/extractConfigFromPage';
import App from 'components/App';
import { configReceived } from 'actions/Config';
import { editorSetOpenFronts } from 'bundles/frontsUIBundle';
import { storeClipboardContent } from 'actions/Clipboard';
import { Dispatch } from 'types/Store';
import Modal from 'react-modal';
import { init as initGA } from 'services/GA';
import { init } from 'keyboard-shortcuts/init';
import pollingConfig from 'util/pollingConfig';

initGA();

const store = configureStore();
const config = extractConfigFromPage();

// publish uncaught errors to sentry.io
if (config.env.toUpperCase() !== 'DEV' && config.sentryPublicDSN) {
  const sentryOptions = {
    tags: {
      stack: 'cms-fronts',
      stage: config.env.toUpperCase(),
      app: 'facia-tool-v2'
    }
  };

  Raven.config(config.sentryPublicDSN, sentryOptions).install();
}

store.dispatch(configReceived(config));
if (config.frontIds) {
  store.dispatch(editorSetOpenFronts(config.frontIds));
}

(store.dispatch as Dispatch)(storeClipboardContent(config.clipboardArticles));

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
      <BrowserRouter basename="/v2">
        <App />
      </BrowserRouter>
    </Provider>,
    reactMount
  );
}
