import { applyMiddleware, compose, createStore } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
import { middleware as presenceMiddleware } from '../presence';

import rootReducer from 'reducers/rootReducer';
import {
  updateStateFromUrlChange,
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit
} from './storeMiddleware';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { Config } from 'types/Config';

export default function configureStore(config: Config, initialState?: State) {
  const history = createBrowserHistory();
  const router = routerMiddleware(history);
  const reducer = enableBatching(rootReducer);
  const middleware = compose(
    applyMiddleware(
      thunkMiddleware,
      updateStateFromUrlChange,
      router,
      // @TODO: take URL from config
      presenceMiddleware<State, Dispatch>(
        'presence.local.dev-gutools.co.uk',
        {
          firstName: config.firstName,
          lastName: config.lastName,
          email: config.email
        },
        'fronts'
      ),
      persistCollectionOnEdit(),
      persistClipboardOnEdit(),
      persistOpenFrontsOnEdit()
    ),
    window.devToolsExtension ? window.devToolsExtension() : (f: unknown) => f
  );
  const store = initialState
    ? createStore(reducer, initialState, middleware)
    : createStore(reducer, middleware);

  if (module.hot) {
    module.hot.accept('reducers/rootReducer.js', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
