// @flow

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

const store = configureStore();
const config = extractConfigFromPage();

// publish uncaught errors to sentry.io
if (config.stage === 'PROD' && config.ravenUrl)
  Raven.config(config.ravenUrl).install();

store.dispatch(configReceived(config));
if (config.frontIds) {
  store.dispatch(editorSetOpenFronts(config.frontIds));
}

// This is broken because this a thunk and dispatch doesn't know about thunks
// even though we're using the thunk middleware!
// $FlowFixMe
store.dispatch(storeClipboardContent(config.clipboardArticles));

const reactMount = document.getElementById('react-mount');

if (reactMount) {
  render(
    <Provider store={store}>
      <BrowserRouter basename="/v2">
        <App />
      </BrowserRouter>
    </Provider>,
    reactMount
  );
}
