/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */
import {
  AddGroupArticleFragment as SharedAddGroupArticleFragment,
  RemoveGroupArticleFragment as SharedRemoveGroupArticleFragment,
  AddSupportingArticleFragment as SharedAddSupportingArticleFragment,
  RemoveSupportingArticleFragment as SharedRemoveSupportingArticleFragment,
  Action as SharedActions
} from 'shared/types/Action';
import { PersistMeta } from 'util/storeMiddleware';
import { Config } from './Config';
import { FrontsConfig, VisibleArticlesResponse } from './FaciaApi';
import { BatchAction } from 'redux-batched-actions';
import { Stages } from 'shared/types/Collection';

interface EditorAddFront {
  type: 'EDITOR_OPEN_FRONT';
  payload: { frontId: string };
  meta: PersistMeta;
}

interface EditorCloseFront {
  type: 'EDITOR_CLOSE_FRONT';
  payload: { frontId: string };
  meta: PersistMeta;
}

interface EditorClearOpenFronts {
  type: 'EDITOR_CLEAR_OPEN_FRONTS';
  meta: PersistMeta;
}

interface EditorSetOpenFronts {
  type: 'EDITOR_SET_OPEN_FRONTS';
  payload: { frontIds: string[] };
}

interface EditorSelectArticleFragment {
  type: 'EDITOR_SELECT_ARTICLE_FRAGMENT';
  payload: {
    articleFragmentId: string;
    frontId: string;
  };
}

interface EditorClearArticleFragmentSelection {
  type: 'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION';
  payload: {
    frontId: string;
  };
}

interface ActionPersistMeta {
  meta: PersistMeta;
}

type AddGroupArticleFragment = SharedAddGroupArticleFragment &
  ActionPersistMeta;

type RemoveGroupArticleFragment = SharedRemoveGroupArticleFragment &
  ActionPersistMeta;

type AddSupportingArticleFragment = SharedAddSupportingArticleFragment &
  ActionPersistMeta;

type RemoveSupportingArticleFragment = SharedRemoveSupportingArticleFragment &
  ActionPersistMeta;

type ActionError =
  | 'Could not fetch fronts config'
  | 'Could not fetch collection'
  | 'Could not fetch articles from Capi'
  | '';

type ErrorActionType = 'CAUGHT_ERROR';

interface ConfigReceivedAction {
  type: 'CONFIG_RECEIVED';
  payload: Config;
}

interface FrontsConfigReceivedAction {
  type: 'FRONTS_CONFIG_RECEIVED';
  payload: FrontsConfig;
}

interface FrontsUpdateLastPressedAction {
  type: 'FETCH_LAST_PRESSED_SUCCESS';
  payload: {
    receivedAt: number;
    frontId: string;
    datePressed: string;
  };
}

interface RequestFrontsConfigAction {
  type: 'FRONTS_CONFIG_GET_RECEIVE';
  receivedAt: number;
}

interface ClearError {
  type: 'CLEAR_ERROR';
  receivedAt: number;
}

interface PathUpdate {
  type: 'PATH_UPDATE';
  path: string;
}

interface RequestFrontCollectionAction {
  type: 'FRONTS_COLLECTION_GET_RECEIVE';
  receivedAt: number;
}

interface ErrorInAction {
  type: ErrorActionType;
  message: ActionError;
  error: string;
  receivedAt: number;
}

interface RecordUnpublishedChanges {
  type: 'RECORD_UNPUBLISHED_CHANGES';
  payload: { [id: string]: boolean };
}

interface PublishCollectionSuccess {
  type: 'PUBLISH_COLLECTION_SUCCESS';
  payload: { collectionId: string };
}

interface UpdateClipboardContent {
  type: 'UPDATE_CLIPBOARD_CONTENT';
  payload: string[];
}

interface AddClipboardArticleFragment {
  type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT';
  payload: { articleFragmentId: string; index: number };
}

interface AddClipboardContent {
  type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT';
  payload: { articleFragmentId: string; index: number };
  meta: PersistMeta;
}

interface RemoveClipboardArticleFragment {
  type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT';
  payload: { articleFragmentId: string };
}

interface RecordStaleFronts {
  type: 'RECORD_STALE_FRONTS';
  payload: { [id: string]: boolean };
}

interface FetchVisibleArticlesSuccess {
  type: 'FETCH_VISIBLE_ARTICLES_SUCCESS';
  payload: { collectionId: string, visibleArticles: VisibleArticlesResponse, stage: Stages }
}

type Action =
  | ConfigReceivedAction
  | FrontsConfigReceivedAction
  | RequestFrontsConfigAction
  | ClearError
  | PathUpdate
  | RequestFrontCollectionAction
  | ErrorInAction
  | FrontsUpdateLastPressedAction
  | SharedActions
  | RecordUnpublishedChanges
  | PublishCollectionSuccess
  | AddGroupArticleFragment
  | RemoveGroupArticleFragment
  | AddSupportingArticleFragment
  | RemoveSupportingArticleFragment
  | UpdateClipboardContent
  | AddClipboardArticleFragment
  | RemoveClipboardArticleFragment
  | AddClipboardContent
  | EditorAddFront
  | EditorClearOpenFronts
  | EditorSetOpenFronts
  | EditorCloseFront
  | EditorSelectArticleFragment
  | EditorClearArticleFragmentSelection
  | RecordStaleFronts
  | BatchAction
  | FetchVisibleArticlesSuccess

export {
  ActionError,
  Action,
  ActionPersistMeta,
  ConfigReceivedAction,
  FrontsConfigReceivedAction,
  RequestFrontsConfigAction,
  ClearError,
  PathUpdate,
  RequestFrontCollectionAction,
  ErrorInAction,
  FrontsUpdateLastPressedAction,
  SharedActions,
  RecordUnpublishedChanges,
  PublishCollectionSuccess,
  AddGroupArticleFragment,
  RemoveGroupArticleFragment,
  AddSupportingArticleFragment,
  RemoveSupportingArticleFragment,
  UpdateClipboardContent,
  AddClipboardArticleFragment,
  RemoveClipboardArticleFragment,
  AddClipboardContent,
  EditorAddFront,
  EditorClearOpenFronts,
  EditorSetOpenFronts,
  EditorCloseFront,
  EditorSelectArticleFragment,
  EditorClearArticleFragmentSelection,
  RecordStaleFronts
};
