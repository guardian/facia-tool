import { applyMiddleware, compose, createStore } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';

import rootReducer from 'reducers/rootReducer';
import {
  updateStateFromUrlChange,
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit,
  persistFavouriteFrontsOnEdit
} from './storeMiddleware';
import { State } from 'types/State';

export default function configureStore(initialState?: State) {
  const history = createBrowserHistory();
  const router = routerMiddleware(history);
  const reducer = enableBatching(rootReducer);
  const middleware = compose(
    applyMiddleware(
      thunkMiddleware,
      updateStateFromUrlChange,
      router,
      persistCollectionOnEdit(),
      persistClipboardOnEdit(),
      persistOpenFrontsOnEdit(),
      persistFavouriteFrontsOnEdit()
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
