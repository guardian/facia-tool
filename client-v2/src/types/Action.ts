/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */
import {
  InsertGroupArticleFragment as SharedInsertGroupArticleFragment,
  InsertSupportingArticleFragment as SharedInsertSupportingArticleFragment,
  RemoveGroupArticleFragment as SharedRemoveGroupArticleFragment,
  RemoveSupportingArticleFragment as SharedRemoveSupportingArticleFragment,
  Action as SharedActions,
  InsertArticleFragmentPayload,
  RemoveArticleFragmentPayload
} from 'shared/types/Action';
import { PersistMeta } from 'util/storeMiddleware';
import { Config } from './Config';
import { FrontsConfig, VisibleArticlesResponse } from './FaciaApi';
import { BatchAction } from 'redux-batched-actions';
import { Stages } from 'shared/types/Collection';
import {
  EDITOR_OPEN_CURRENT_FRONTS_MENU,
  EDITOR_CLOSE_CURRENT_FRONTS_MENU,
  EDITOR_OPEN_FRONT,
  EDITOR_MOVE_FRONT,
  EDITOR_CLOSE_FRONT,
  EDITOR_FAVOURITE_FRONT,
  EDITOR_UNFAVOURITE_FRONT,
  EDITOR_SET_OPEN_FRONTS,
  EDITOR_SET_FAVE_FRONTS,
  EDITOR_OPEN_COLLECTION,
  EDITOR_CLOSE_COLLECTION,
  EDITOR_CLEAR_OPEN_FRONTS,
  EDITOR_SELECT_ARTICLE_FRAGMENT,
  EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION,
  EDITOR_OPEN_CLIPBOARD,
  EDITOR_CLOSE_CLIPBOARD,
  EDITOR_OPEN_OVERVIEW,
  EDITOR_CLOSE_OVERVIEW,
  EDITOR_OPEN_ALL_OVERVIEWS,
  EDITOR_CLOSE_ALL_OVERVIEWS
} from 'bundles/frontsUIBundle';
import { setFocusState, resetFocusState } from '../bundles/focusBundle';
import { ActionSetFeatureValue } from 'shared/redux/modules/featureSwitches';

interface EditorOpenCurrentFrontsMenu {
  type: typeof EDITOR_OPEN_CURRENT_FRONTS_MENU;
}

interface EditorCloseCurrentFrontsMenu {
  type: typeof EDITOR_CLOSE_CURRENT_FRONTS_MENU;
}

interface EditorAddFront {
  type: typeof EDITOR_OPEN_FRONT;
  payload: { frontId: string; priority: string };
  meta: PersistMeta;
}

interface EditorMoveFront {
  type: typeof EDITOR_MOVE_FRONT;
  payload: { frontId: string; toIndex: number };
  meta: PersistMeta;
}

interface EditorCloseFront {
  type: typeof EDITOR_CLOSE_FRONT;
  payload: { frontId: string };
  meta: PersistMeta;
}

interface EditorFavouriteFront {
  type: typeof EDITOR_FAVOURITE_FRONT;
  payload: { frontId: string; priority: string };
  meta: PersistMeta;
}

interface EditorUnfavouriteFront {
  type: typeof EDITOR_UNFAVOURITE_FRONT;
  payload: { frontId: string; priority: string };
  meta: PersistMeta;
}

interface EditorSetFavouriteFronts {
  type: typeof EDITOR_SET_FAVE_FRONTS;
  payload: { favouriteFrontIdsByPriority: { [id: string]: string[] } };
}

interface EditorOpenCollection {
  type: typeof EDITOR_OPEN_COLLECTION;
  payload: { collectionIds: string | string[] };
}

interface EditorCloseCollection {
  type: typeof EDITOR_CLOSE_COLLECTION;
  payload: { collectionIds: string | string[] };
}

interface EditorClearOpenFronts {
  type: typeof EDITOR_CLEAR_OPEN_FRONTS;
  meta: PersistMeta;
}

interface EditorSetOpenFronts {
  type: typeof EDITOR_SET_OPEN_FRONTS;
  payload: { frontIdsByPriority: { [id: string]: string[] } };
}

interface EditorSelectArticleFragment {
  type: typeof EDITOR_SELECT_ARTICLE_FRAGMENT;
  payload: {
    articleFragmentId: string;
    frontId: string;
    collectionId: string;
    isSupporting: boolean;
  };
}

interface EditorClearArticleFragmentSelection {
  type: typeof EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION;
  payload: {
    articleFragmentId: string;
  };
}

interface EditorOpenClipboard {
  type: typeof EDITOR_OPEN_CLIPBOARD;
}

interface EditorCloseClipboard {
  type: typeof EDITOR_CLOSE_CLIPBOARD;
}

interface EditorOpenOverview {
  type: typeof EDITOR_OPEN_OVERVIEW;
  payload: {
    frontId: string;
  };
}
interface EditorCloseOverview {
  type: typeof EDITOR_CLOSE_OVERVIEW;
  payload: {
    frontId: string;
  };
}

interface EditorOpenAllOverviews {
  type: typeof EDITOR_OPEN_ALL_OVERVIEWS;
}

interface EditorCloseAllOverviews {
  type: typeof EDITOR_CLOSE_ALL_OVERVIEWS;
}

interface ActionPersistMeta {
  meta: PersistMeta;
}

type InsertGroupArticleFragment = SharedInsertGroupArticleFragment &
  ActionPersistMeta;
type InsertSupportingArticleFragment = SharedInsertSupportingArticleFragment &
  ActionPersistMeta;
type InsertClipboardArticleFragment = {
  type: 'INSERT_CLIPBOARD_ARTICLE_FRAGMENT';
} & { payload: InsertArticleFragmentPayload };

type RemoveGroupArticleFragment = SharedRemoveGroupArticleFragment &
  ActionPersistMeta;
type RemoveSupportingArticleFragment = SharedRemoveSupportingArticleFragment &
  ActionPersistMeta;
type RemoveClipboardArticleFragment = {
  type: 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT';
} & RemoveArticleFragmentPayload;

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

interface ClearClipboard {
  type: 'CLEAR_CLIPBOARD';
  payload: { id: string };
}

interface RecordStaleFronts {
  type: 'RECORD_STALE_FRONTS';
  payload: { [id: string]: boolean };
}

interface FetchVisibleArticlesSuccess {
  type: 'FETCH_VISIBLE_ARTICLES_SUCCESS';
  payload: {
    collectionId: string;
    visibleArticles: VisibleArticlesResponse;
    stage: Stages;
  };
}

interface StartConfirm {
  type: 'MODAL/START_CONFIRM';
  payload: {
    title: string;
    description: string;
    onAccept: Action[];
    onReject: Action[];
  };
}

interface EndConfirm {
  type: 'MODAL/END_CONFIRM';
}

type SetFocusState = ReturnType<typeof setFocusState>;
type ResetFocusState = ReturnType<typeof resetFocusState>;

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
  | InsertGroupArticleFragment
  | InsertSupportingArticleFragment
  | InsertClipboardArticleFragment
  | RemoveGroupArticleFragment
  | RemoveSupportingArticleFragment
  | RemoveClipboardArticleFragment
  | UpdateClipboardContent
  | ClearClipboard
  | EditorOpenCurrentFrontsMenu
  | EditorCloseCurrentFrontsMenu
  | EditorAddFront
  | EditorMoveFront
  | EditorClearOpenFronts
  | EditorSetOpenFronts
  | EditorCloseFront
  | EditorFavouriteFront
  | EditorUnfavouriteFront
  | EditorSetFavouriteFronts
  | EditorSelectArticleFragment
  | EditorClearArticleFragmentSelection
  | EditorOpenClipboard
  | EditorCloseClipboard
  | EditorOpenOverview
  | EditorCloseOverview
  | EditorOpenAllOverviews
  | EditorCloseAllOverviews
  | RecordStaleFronts
  | BatchAction
  | FetchVisibleArticlesSuccess
  | StartConfirm
  | EndConfirm
  | EditorOpenCollection
  | EditorCloseCollection
  | SetFocusState
  | ResetFocusState
  | ActionSetFeatureValue;

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
  InsertGroupArticleFragment,
  InsertSupportingArticleFragment,
  InsertClipboardArticleFragment,
  RemoveGroupArticleFragment,
  RemoveSupportingArticleFragment,
  RemoveClipboardArticleFragment,
  UpdateClipboardContent,
  ClearClipboard,
  EditorOpenCurrentFrontsMenu,
  EditorCloseCurrentFrontsMenu,
  EditorAddFront,
  EditorMoveFront,
  EditorClearOpenFronts,
  EditorSetOpenFronts,
  EditorCloseFront,
  EditorFavouriteFront,
  EditorUnfavouriteFront,
  EditorSetFavouriteFronts,
  EditorOpenCollection,
  EditorCloseCollection,
  EditorSelectArticleFragment,
  EditorClearArticleFragmentSelection,
  EditorOpenClipboard,
  EditorCloseClipboard,
  EditorOpenOverview,
  EditorCloseOverview,
  EditorOpenAllOverviews,
  EditorCloseAllOverviews,
  RecordStaleFronts,
  StartConfirm,
  EndConfirm
};
