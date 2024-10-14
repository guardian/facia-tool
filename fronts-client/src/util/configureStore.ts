import { applyMiddleware, compose, createStore } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware, push } from 'react-router-redux';

import rootReducer from 'reducers/rootReducer';
import {
	updateStateFromUrlChange,
	persistCollectionOnEdit,
	persistClipboardOnEdit,
	persistOpenFrontsOnEdit,
	persistFavouriteFrontsOnEdit,
} from './storeMiddleware';

export default function configureStore(
	initialState?: any,
	initialPath?: string /* only used for tests */,
) {
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
			persistFavouriteFrontsOnEdit(),
		),
		window.__REDUX_DEVTOOLS_EXTENSION__
			? window.__REDUX_DEVTOOLS_EXTENSION__()
			: (f: unknown) => f,
	);
	const store = initialState
		? createStore(reducer, initialState, middleware)
		: createStore(reducer, middleware);

	if (initialPath) {
		store.dispatch(push(initialPath));
	}

	return store;
}
