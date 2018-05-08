// @flow

import type { Action } from 'Types/Action';
import type { ThunkAction } from 'Types/Store';
import type { FrontsConfig } from 'Types/FrontsConfig';

import { fetchFrontsConfig } from 'Services/faciaApi';

function frontsConfigReceived(config: FrontsConfig): Action {
  return {
    type: 'FRONTS_CONFIG_RECEIVED',
    payload: config
  };
}

function requestFrontsConfig(): Action {
  return {
    type: 'FRONTS_CONFIG_GET_RECEIVE',
    receivedAt: Date.now()
  };
}

function errorReceivingConfig(error: string): Action {
  return {
    type: 'CAUGHT_ERROR',
    message: 'Could not fetch fronts config',
    error,
    receivedAt: Date.now()
  };
}

export default function getFrontsConfig(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestFrontsConfig());
    return fetchFrontsConfig()
      .then((res: Object) => dispatch(frontsConfigReceived(res)))
      .catch((error: string) => dispatch(errorReceivingConfig(error)));
  };
}
