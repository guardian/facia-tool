

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
import { FrontsConfig } from './FaciaApi';

type EditorAddFront = {
  type: 'EDITOR_OPEN_FRONT',
  payload: { frontId: string },
  meta: PersistMeta
};

type EditorCloseFront = {
  type: 'EDITOR_CLOSE_FRONT',
  payload: { frontId: string },
  meta: PersistMeta
};

type EditorClearOpenFronts = {
  type: 'EDITOR_CLEAR_OPEN_FRONTS',
  meta: PersistMeta
};

type EditorSetOpenFronts = {
  type: 'EDITOR_SET_OPEN_FRONTS',
  payload: { frontIds: string[] }
};

type EditorSelectArticleFragment = {
  type: 'EDITOR_SELECT_ARTICLE_FRAGMENT',
  payload: {
    articleFragmentId: string,
    frontId: string
  }
};

type EditorClearArticleFragmentSelection = {
  type: 'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION',
  payload: {
    frontId: string
  }
};

type AddGroupArticleFragment = {
  ...SharedAddGroupArticleFragment,
  meta: PersistMeta
};

type RemoveGroupArticleFragment = {
  ...SharedRemoveGroupArticleFragment,
  meta: PersistMeta
};

type AddSupportingArticleFragment = {
  ...SharedAddSupportingArticleFragment,
  meta: PersistMeta
};

type RemoveSupportingArticleFragment = {
  ...SharedRemoveSupportingArticleFragment,
  meta: PersistMeta
};

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

type RecordUnpublishedChanges = {
  type: 'RECORD_UNPUBLISHED_CHANGES',
  payload: { [string]: boolean }
};

type PublishCollectionSuccess = {
  type: 'PUBLISH_COLLECTION_SUCCESS',
  payload: { collectionId: string }
};

type UpdateClipboardContent = {
  type: 'UPDATE_CLIPBOARD_CONTENT',
  payload: Array<string>
};

type AddClipboardArticleFragment = {
  type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT',
  payload: { articleFragmentId: string, index: number }
};

type AddClipboardContent = {
  type: 'ADD_CLIPBOARD_ARTICLE_FRAGMENT',
  payload: { articleFragmentId: string, index: number },
  meta: PersistMeta
};

type RemoveClipboardArticleFragment = {
  type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT',
  payload: { articleFragmentId: string }
};

type RecordStaleFronts = {
  type: 'RECORD_STALE_FRONTS',
  payload: { [string]: boolean }
};

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
  | RecordStaleFronts;

type BatchedAction = {
  type: 'BATCHING_REDUCER.BATCH',
  payload: Action[]
};

type ActionWithBatchedActions = Action | BatchedAction;

export ActionType = $ElementType<Action, 'type'>;
export { ActionError, Action, ActionWithBatchedActions };
