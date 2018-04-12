// @flow

import { type Middleware } from 'redux';
import { type State } from '../types/State';
import { type Action } from '../types/Action';

export const updateStateFromUrlChange: Middleware<State, Action> = ({
  dispatch,
  getState
}) => next => action => {
  const prevState = getState();
  const result = next(action);
  getState();

  if (prevState.path !== window.location.pathname) {
    dispatch({
      type: 'PATH_UPDATE',
      path: window.location.pathname,
      receivedAt: Date.now()
    });

    dispatch({
      type: 'CLEAR_ERROR',
      receivedAt: Date.now()
    });
  }

  return result;
};
