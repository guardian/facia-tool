import { applyMiddleware, compose, createStore } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware, push } from 'react-router-redux';

import rootReducer from 'reducers/rootReducer';
import {
  updateStateFromUrlChange,
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit,
  persistFavouriteFrontsOnEdit
} from './storeMiddleware';
import { State } from 'types/State';
import { ExtraThunkArgs } from 'types/Store';
import { fetchFrontsConfigStrategy } from 'strategies/fetch-fronts-config';
import { fetchCollectionsStrategy } from 'strategies/fetch-collection';

export default function configureStore(
  initialState?: State,
  initialPath?: string /* only used for tests */
) {
  const history = createBrowserHistory();
  const router = routerMiddleware(history);
  const reducer = enableBatching(rootReducer);
  const extraArgs: ExtraThunkArgs = {
    fetchFrontsConfig: fetchFrontsConfigStrategy,
    fetchCollections: fetchCollectionsStrategy
  };
  const middleware = compose(
    applyMiddleware(
      thunkMiddleware.withExtraArgument(extraArgs),
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

  if (initialPath) {
    store.dispatch(push(initialPath));
  }

  return store;
}
