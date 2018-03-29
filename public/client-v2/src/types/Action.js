// @flow

/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */

type ConfigReceivedAction = {
  type: 'CONFIG_RECEIVED',
  payload: Object
};

type FrontsConfigReceivedAction = {
  type: 'FRONTS_CONFIG_RECEIVED',
  payload: Object
};

type RequestFrontsConfigAction = {
  type: 'FRONTS_CONFIG_GET_RECEIVE',
  receivedAt: number
};

type FrontsConfigError = {
  type: 'CAUGHT_ERROR',
  message: 'Could not fetch fronts config',
  error: string,
  receivedAt: number
};

export type Action =
  | ConfigReceivedAction
  | FrontsConfigReceivedAction
  | RequestFrontsConfigAction
  | FrontsConfigError;

export type ActionType = $ElementType<Action, 'type'>;
