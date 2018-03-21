import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { BrowserRouter } from 'react-router-dom';
import configureStore from './util/configureStore';
import { setStore } from './util/storeAccessor';
import App from './components/App';

function extractConfigFromPage() {
  const configEl = document.getElementById('config');

  if (!configEl) {
    return {};
  }

  return JSON.parse(configEl.innerHTML);
}

const store = configureStore();
const config = extractConfigFromPage();

// publish uncaught errors to sentry.io
if (config.stage === 'PROD') Raven.config(config.ravenUrl).install();

setStore(store);

store.dispatch({
  type: 'CONFIG_RECEIVED',
  config: Object.assign({}, extractConfigFromPage()),
  receivedAt: Date.now()
});

render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('react-mount')
);
