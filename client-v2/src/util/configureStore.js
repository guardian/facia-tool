// @flow

import {
  applyMiddleware,
  compose,
  createStore,
  type Reducer,
  type StoreEnhancer,
  type Store as ReduxStore,
  type Dispatch
} from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
import { type Store } from 'types/Store';
import { type State } from 'types/State';
import { type Action } from 'types/Action';
import rootReducer from 'reducers/rootReducer.js';
import {
  updateStateFromUrlChange,
  persistCollectionOnEdit
} from './storeMiddleware';

type CreateStore = (
  reducer: Reducer<State, Action>,
  enhancer?: StoreEnhancer<State, Action, Dispatch<Action>>
) => ReduxStore<State, Action, Dispatch<Action>>;

export default function configureStore(): Store {
  const history = createBrowserHistory();
  const router = routerMiddleware(history);
  const store = (createStore: CreateStore)(
    enableBatching(rootReducer),
    compose(
      applyMiddleware(
        thunkMiddleware,
        updateStateFromUrlChange,
        router,
        persistCollectionOnEdit
      ),
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
