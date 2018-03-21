import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers/rootReducer.js';

export default function configureStore() {
  const router = routerMiddleware(browserHistory);
  const store = createStore(
    rootReducer,
    compose(
      applyMiddleware(thunkMiddleware),
      applyMiddleware(router),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

  /* globals module:false */
  if (module.hot) {
    module.hot.accept('../reducers/rootReducer.js', () => {
      store.replaceReducer(rootReducer);
    });
  }

  return store;
}
