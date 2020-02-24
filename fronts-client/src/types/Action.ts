/**
 * Need to add new types into here and union them with `Action` in order
 * for typing to work nicely in reducers
 */
import {
  InsertGroupCard as SharedInsertGroupCard,
  InsertSupportingCard as SharedInsertSupportingCard,
  RemoveGroupCard as SharedRemoveGroupCard,
  RemoveSupportingCard as SharedRemoveSupportingCard,
  Action as SharedActions,
  InsertCardPayload,
  RemoveCardPayload
} from 'shared/types/Action';
import { PersistMeta } from 'util/storeMiddleware';
import { Config } from './Config';
import {
  FrontsConfig,
  VisibleArticlesResponse,
  EditionsFrontMetadata
} from './FaciaApi';
import { BatchAction } from 'redux-batched-actions';
import { Stages, Card } from 'types/Collection';
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
  EDITOR_SELECT_CARD,
  EDITOR_CLEAR_CARD_SELECTION,
  EDITOR_OPEN_CLIPBOARD,
  EDITOR_CLOSE_CLIPBOARD,
  EDITOR_OPEN_OVERVIEW,
  EDITOR_CLOSE_OVERVIEW,
  EDITOR_OPEN_ALL_OVERVIEWS,
  EDITOR_CLOSE_ALL_OVERVIEWS,
  CHANGED_BROWSING_STAGE,
  EditorCloseFormsForCollection
} from 'bundles/frontsUIBundle';
import { setFocusState, resetFocusState } from '../bundles/focusBundle';
import { ActionSetFeatureValue } from 'redux/modules/featureSwitches';
import { ReactNode } from 'react';
import { SetHidden } from '../bundles/collectionsBundle';
import { OptionsModalChoices } from './Modals';

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

interface ChangedBrowsingStage {
  type: typeof CHANGED_BROWSING_STAGE;
  payload: { frontId: string; browsingStage: Stages };
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

interface EditorSelectCard {
  type: typeof EDITOR_SELECT_CARD;
  payload: {
    cardId: string;
    frontId: string;
    collectionId: string;
    isSupporting: boolean;
  };
}

interface EditorClearCardSelection {
  type: typeof EDITOR_CLEAR_CARD_SELECTION;
  payload: {
    cardId: string;
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

type InsertGroupCard = SharedInsertGroupCard & ActionPersistMeta;
type InsertSupportingCard = SharedInsertSupportingCard & ActionPersistMeta;
type InsertClipboardCard = {
  type: 'INSERT_CLIPBOARD_CARD';
} & { payload: InsertCardPayload & { currentCards: { [uuid: string]: Card } } };

type RemoveGroupCard = SharedRemoveGroupCard & ActionPersistMeta;
type RemoveSupportingCard = SharedRemoveSupportingCard & ActionPersistMeta;
type RemoveClipboardCard = {
  type: 'REMOVE_CLIPBOARD_CARD';
} & RemoveCardPayload;

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

interface StartOptionsModal {
  type: 'MODAL/START_OPTIONS_MODAL';
  payload: {
    title: string;
    description: string | ReactNode;
    options: OptionsModalChoices[];
    onCancel: () => void;
    showCancelButton: boolean;
  };
}

interface EndOptionsModal {
  type: 'MODAL/END_OPTIONS_MODAL';
}

interface IsPrefillMode {
  type: 'FEED_STATE_IS_PREFILL_MODE';
  payload: {
    isPrefillMode: boolean;
  };
}

interface EditionsFrontMetadataUpdate {
  type: 'FETCH_UPDATE_METADATA_SUCCESS';
  payload: {
    frontId: string;
    metadata: EditionsFrontMetadata;
  };
}

interface EditionsFrontHiddenStateUpdate {
  type: 'FETCH_FRONT_HIDDEN_STATE_SUCCESS';
  payload: {
    frontId: string;
    hidden: boolean;
  };
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
  | InsertGroupCard
  | InsertSupportingCard
  | InsertClipboardCard
  | RemoveGroupCard
  | RemoveSupportingCard
  | RemoveClipboardCard
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
  | EditorSelectCard
  | EditorClearCardSelection
  | EditorOpenClipboard
  | EditorCloseClipboard
  | EditorOpenOverview
  | EditorCloseOverview
  | EditorOpenAllOverviews
  | EditorCloseAllOverviews
  | RecordStaleFronts
  | BatchAction
  | FetchVisibleArticlesSuccess
  | EditorOpenCollection
  | EditorCloseCollection
  | SetFocusState
  | ResetFocusState
  | ActionSetFeatureValue
  | EditionsFrontMetadataUpdate
  | EditionsFrontHiddenStateUpdate
  | IsPrefillMode
  | SetHidden
  | ChangedBrowsingStage
  | EditorCloseFormsForCollection
  | StartOptionsModal
  | EndOptionsModal;

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
  InsertGroupCard,
  InsertSupportingCard,
  InsertClipboardCard,
  RemoveGroupCard,
  RemoveSupportingCard,
  RemoveClipboardCard,
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
  EditorSelectCard,
  EditorClearCardSelection,
  EditorOpenClipboard,
  EditorCloseClipboard,
  EditorOpenOverview,
  EditorCloseOverview,
  EditorOpenAllOverviews,
  EditorCloseAllOverviews,
  RecordStaleFronts,
  IsPrefillMode,
  ChangedBrowsingStage,
  StartOptionsModal,
  EndOptionsModal
};
