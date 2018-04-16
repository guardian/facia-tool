// @flow

import { type Config } from './Config';

/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */

import type { Collection } from './Collection';

type ErrorActionType = 'CAUGHT_ERROR';
type ConfigReceivedAction = {
  type: 'CONFIG_RECEIVED',
  payload: Config
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
  type: ErrorActionType,
  message: 'Could not fetch fronts config',
  // eslint-disable-next-line no-use-before-define
  error: string,
  receivedAt: number
};

type ClearError = {
  type: 'CLEAR_ERROR',
  receivedAt: number
};

type PathUpdate = {
  type: 'PATH_UPDATE',
  path: string
};

type FrontCollectionReceivedAction = {
  type: 'FRONTS_COLLECTION_RECEIVED',
  id: string,
  payload: Collection
};

type RequestFrontCollectionAction = {
  type: 'FRONTS_COLLECTION_GET_RECEIVE',
  receivedAt: number
};

type ErrorReceivingFrontCollectionAction = {
  type: ErrorActionType,
  message: 'Could not fetch collection',
  error: string,
  receivedAt: number
};

export type Action =
  | ConfigReceivedAction
  | FrontsConfigReceivedAction
  | RequestFrontsConfigAction
  | FrontsConfigError
  | ClearError
  | PathUpdate
  | FrontCollectionReceivedAction
  | RequestFrontCollectionAction
  | ErrorReceivingFrontCollectionAction;

export type ActionType = $ElementType<Action, 'type'>;

export type ActionError =
  | 'Could not fetch fronts config'
  | 'Could not fetch collection'
  | '';
