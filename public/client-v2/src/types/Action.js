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

export type Action = ConfigReceivedAction | FrontsConfigReceivedAction;
export type ActionType = $ElementType<Action, 'type'>;
