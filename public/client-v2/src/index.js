// @flow

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { BrowserRouter } from 'react-router-dom';
import configureStore from './util/configureStore';
import extractConfigFromPage from './util/extractConfigFromPage';
import App from './components/App';
import { configReceived } from './actions/Config';

const store = configureStore();
const config = extractConfigFromPage();

// publish uncaught errors to sentry.io
if (config.stage === 'PROD') Raven.config((config.ravenUrl: any)).install();

store.dispatch(configReceived(extractConfigFromPage()));

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
