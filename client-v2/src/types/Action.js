// @flow

import { type Config } from './Config';
import { type CollectionArticles } from './Collection';

/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */

import type { Collection } from './Collection';

type ActionError =
  | 'Could not fetch fronts config'
  | 'Could not fetch collection'
  | 'Could not fetch collection articles from capi'
  | '';

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

type ErrorInAction = {
  type: ErrorActionType,
  message: ActionError,
  error: string,
  receivedAt: number
};

type CollectionArticlesReceived = {
  type: 'CAPI_ARTICLES_RECEIVED',
  id: string,
  payload: CollectionArticles
};

type RequestCollectionArticles = {
  type: 'CAPI_ARTICLES_GET_RECEIVE',
  receivedAt: number
};

export type Action =
  | ConfigReceivedAction
  | FrontsConfigReceivedAction
  | RequestFrontsConfigAction
  | ClearError
  | PathUpdate
  | FrontCollectionReceivedAction
  | RequestFrontCollectionAction
  | ErrorInAction
  | CollectionArticlesReceived
  | RequestCollectionArticles;

export type ActionType = $ElementType<Action, 'type'>;
export type { ActionError };
