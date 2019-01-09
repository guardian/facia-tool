import {
  applyMiddleware,
  compose,
  createStore
} from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';

import rootReducer from 'reducers/rootReducer';
import {
  updateStateFromUrlChange,
  persistCollectionOnEdit,
  persistClipboardOnEdit,
  persistOpenFrontsOnEdit
} from './storeMiddleware';
import { Config } from 'types/Config';
import { ThunkArgs } from 'types/ThunkArgs';

export default function configureStore(config: Config, extraArgs: ThunkArgs) {
  const history = createBrowserHistory();
  const router = routerMiddleware(history);
  const store = createStore(
    // @todo -- AnyAction in batch reducer definition not compatible with our action types
    enableBatching(rootReducer),
    compose(
      applyMiddleware(
        thunkMiddleware.withExtraArgument(extraArgs),
        updateStateFromUrlChange,
        router,
        persistCollectionOnEdit(),
        persistClipboardOnEdit(),
        persistOpenFrontsOnEdit()
      ),
      window.devToolsExtension ? window.devToolsExtension() : (f: unknown) => f
    )
  );

  if (module.hot) {
    module.hot.accept('reducers/rootReducer.js', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
