// @flow

/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */

import type { Action as SharedActions } from 'shared/types/Action';
import { type Config } from './Config';
import { type FrontsConfig } from './FaciaApi';

type ActionError =
  | 'Could not fetch fronts config'
  | 'Could not fetch collection'
  | 'Could not fetch articles from Capi'
  | '';

type ErrorActionType = 'CAUGHT_ERROR';
type ConfigReceivedAction = {
  type: 'CONFIG_RECEIVED',
  payload: Config
};

type FrontsConfigReceivedAction = {
  type: 'FRONTS_CONFIG_RECEIVED',
  payload: FrontsConfig
};

type FrontsUpdateLastPressedAction = {
  type: 'FETCH_LAST_PRESSED_SUCCESS',
  payload: {
    receivedAt: number,
    frontId: string,
    datePressed: string
  }
};

type RequestFrontsConfigAction = {
  type: 'FRONTS_CONFIG_GET_RECEIVE',
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

type RequestFrontCollectionAction = {
  type: 'FRONTS_COLLECTION_GET_RECEIVE',
  receivedAt: number
};

type ErrorInAction = {
  type: ErrorActionType,
  message: ActionError,
  error: string,
  receivedAt: number
};

export type Action =
  | ConfigReceivedAction
  | FrontsConfigReceivedAction
  | RequestFrontsConfigAction
  | ClearError
  | PathUpdate
  | RequestFrontCollectionAction
  | ErrorInAction
  | FrontsUpdateLastPressedAction
  | SharedActions;

export type ActionType = $ElementType<Action, 'type'>;
export type { ActionError };
