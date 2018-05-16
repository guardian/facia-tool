// @flow

import { applyMiddleware, compose, createStore } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
import { type Store } from 'types/Store';

import rootReducer from 'reducers/rootReducer.js';
import { updateStateFromUrlChange } from './storeMiddleware';

export default function configureStore(): Store {
  const history = createBrowserHistory();
  const router = routerMiddleware(history);
  const store = createStore(
    enableBatching(rootReducer),
    compose(
      applyMiddleware(thunkMiddleware),
      applyMiddleware(updateStateFromUrlChange),
      applyMiddleware(router),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

  /* globals module:false */
  if (module.hot) {
    module.hot.accept('reducers/rootReducer.js', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
