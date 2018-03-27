// @flow

/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */

type ConfigReceivedAction = {
  type: 'CONFIG_RECEIVED',
  payload: Object
};

export type Action = ConfigReceivedAction;
export type ActionType = $ElementType<Action, 'type'>;
