import without from 'lodash/without';
import compact from 'lodash/compact';
import {
  Action,
  EditorShowOpenFrontsMenu as EditorOpenCurrentFrontsMenu,
  EditorHideOpenFrontsMenu as EditorCloseCurrentFrontsMenu,
  EditorCloseFront,
  EditorMoveFront,
  EditorClearOpenFronts,
  EditorSetOpenFronts,
  EditorAddFront,
  EditorSelectArticleFragment,
  EditorClearArticleFragmentSelection,
  EditorOpenCollection,
  EditorCloseCollection,
  EditorOpenClipboard,
  EditorCloseClipboard,
  EditorOpenOverview,
  EditorCloseOverview,
  EditorOpenAllOverviews,
  EditorCloseAllOverviews
} from 'types/Action';
import { State as GlobalState } from 'types/State';
import { events } from 'services/GA';
import { getFronts } from 'selectors/frontsSelectors';
import { createSelector } from 'reselect';
import {
  REMOVE_GROUP_ARTICLE_FRAGMENT,
  REMOVE_SUPPORTING_ARTICLE_FRAGMENT
} from 'shared/actions/ArticleFragments';
import { REMOVE_CLIPBOARD_ARTICLE_FRAGMENT } from 'actions/Clipboard';

export const EDITOR_OPEN_CURRENT_FRONTS_MENU =
  'EDITOR_OPEN_CURRENT_FRONTS_MENU';
export const EDITOR_CLOSE_CURRENT_FRONTS_MENU =
  'EDITOR_CLOSE_CURRENT_FRONTS_MENU';
export const EDITOR_OPEN_FRONT = 'EDITOR_OPEN_FRONT';
export const EDITOR_MOVE_FRONT = 'EDITOR_MOVE_FRONT';
export const EDITOR_CLOSE_FRONT = 'EDITOR_CLOSE_FRONT';
export const EDITOR_CLEAR_OPEN_FRONTS = 'EDITOR_CLEAR_OPEN_FRONTS';
export const EDITOR_SET_OPEN_FRONTS = 'EDITOR_SET_OPEN_FRONTS';
export const EDITOR_OPEN_COLLECTION = 'EDITOR_OPEN_COLLECTION';
export const EDITOR_CLOSE_COLLECTION = 'EDITOR_CLOSE_COLLECTION';
export const EDITOR_SELECT_ARTICLE_FRAGMENT = 'EDITOR_SELECT_ARTICLE_FRAGMENT';
export const EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION =
  'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION';
export const EDITOR_OPEN_CLIPBOARD = 'EDITOR_OPEN_CLIPBOARD';
export const EDITOR_CLOSE_CLIPBOARD = 'EDITOR_CLOSE_CLIPBOARD';
export const EDITOR_OPEN_OVERVIEW = 'EDITOR_OPEN_OVERVIEW';
export const EDITOR_CLOSE_OVERVIEW = 'EDITOR_CLOSE_OVERVIEW';
export const EDITOR_OPEN_ALL_OVERVIEWS = 'EDITOR_OPEN_ALL_OVERVIEWS';
export const EDITOR_CLOSE_ALL_OVERVIEWS = 'EDITOR_CLOSE_ALL_OVERVIEWS';

const editorOpenCollections = (
  collectionIds: string | string[]
): EditorOpenCollection => ({
  type: EDITOR_OPEN_COLLECTION,
  payload: { collectionIds }
});

const editorCloseCollections = (
  collectionIds: string | string[]
): EditorCloseCollection => ({
  type: EDITOR_CLOSE_COLLECTION,
  payload: { collectionIds }
});

const editorOpenCurrentFrontsMenu = (): EditorOpenCurrentFrontsMenu => ({
  type: EDITOR_OPEN_CURRENT_FRONTS_MENU
});

const editorCloseCurrentFrontsMenu = (): EditorCloseCurrentFrontsMenu => ({
  type: EDITOR_CLOSE_CURRENT_FRONTS_MENU
});

/**
 * !SIDE EFFECTS IN ACTION CREATOR
 * we could change these to thunks but the analytics calls are essentially
 * transparent and adding thunks makese the tests for these actions more
 * involved. On balance we're going for it ...
 */

const editorOpenFront = (frontId: string): EditorAddFront => {
  events.addFront(frontId);
  return {
    type: EDITOR_OPEN_FRONT,
    payload: { frontId },
    meta: {
      persistTo: 'openFrontIds'
    }
  };
};

const editorMoveFront = (
  frontId: string,
  fromIndex: number,
  toIndex: number
): EditorMoveFront => {
  events.moveFront(frontId);
  return {
    type: 'EDITOR_MOVE_FRONT',
    payload: { frontId, fromIndex, toIndex },
    meta: {
      persistTo: 'openFrontIds'
    }
  };
};

const editorCloseFront = (frontId: string): EditorCloseFront => {
  events.removeFront(frontId);
  return {
    type: EDITOR_CLOSE_FRONT,
    payload: { frontId },
    meta: {
      persistTo: 'openFrontIds'
    }
  };
};

const editorClearOpenFronts = (): EditorClearOpenFronts => ({
  type: EDITOR_CLEAR_OPEN_FRONTS,
  meta: {
    persistTo: 'openFrontIds'
  }
});

const editorSetOpenFronts = (frontIds: string[]): EditorSetOpenFronts => ({
  type: EDITOR_SET_OPEN_FRONTS,
  payload: {
    frontIds
  }
});

const editorSelectArticleFragment = (
  frontId: string,
  articleFragmentId: string,
  isSupporting = false
): EditorSelectArticleFragment => ({
  type: EDITOR_SELECT_ARTICLE_FRAGMENT,
  payload: { articleFragmentId, frontId, isSupporting }
});

const editorClearArticleFragmentSelection = (
  frontId: string
): EditorClearArticleFragmentSelection => ({
  type: EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION,
  payload: { frontId }
});

const editorOpenClipboard = (): EditorOpenClipboard => ({
  type: EDITOR_OPEN_CLIPBOARD
});

const editorCloseClipboard = (): EditorCloseClipboard => ({
  type: EDITOR_CLOSE_CLIPBOARD
});

const editorOpenOverview = (frontId: string): EditorOpenOverview => ({
  type: EDITOR_OPEN_OVERVIEW,
  payload: {
    frontId
  }
});

const editorCloseOverview = (frontId: string): EditorCloseOverview => ({
  type: EDITOR_CLOSE_OVERVIEW,
  payload: {
    frontId
  }
});

const editorOpenAllOverviews = (): EditorOpenAllOverviews => ({
  type: EDITOR_OPEN_ALL_OVERVIEWS
});

const editorCloseAllOverviews = (): EditorCloseAllOverviews => ({
  type: EDITOR_CLOSE_ALL_OVERVIEWS
});

interface State {
  showOpenFrontsMenu: boolean;
  frontIds: string[];
  collectionIds: string[];
  closedOverviews: string[];
  clipboardOpen: boolean;
  selectedArticleFragments: {
    [frontId: string]: {
      id: string;
      isSupporting: boolean;
    } | void;
  };
}

const selectIsCurrentFrontsMenuOpen = (state: GlobalState) =>
  state.editor.showOpenFrontsMenu;

const selectEditorFrontIds = (state: GlobalState) => state.editor.frontIds;
const selectIsCollectionOpen = <T extends { editor: State }>(
  state: T,
  collectionId: string
) => state.editor.collectionIds.indexOf(collectionId) !== -1;

const createSelectEditorFronts = () =>
  createSelector(
    selectEditorFrontIds,
    getFronts,
    (frontIds, fronts) => compact(frontIds.map(frontId => fronts[frontId]))
  );

const selectIsClipboardOpen = <T extends { editor: State }>(state: T) =>
  state.editor.clipboardOpen;

const selectIsFrontOverviewOpen = <T extends { editor: State }>(
  state: T,
  frontId: string
) => !state.editor.closedOverviews.includes(frontId);

const selectPriority = (
  _: GlobalState,
  { priority }: { priority: string }
): string => priority;

const selectEditorFrontsByPriority = createSelector(
  getFronts,
  selectEditorFrontIds,
  selectPriority,
  (fronts, openFrontIds, priority) => {
    return openFrontIds.filter(frontId => {
      const frontConfig = fronts[frontId];
      return frontConfig && frontConfig.priority === priority;
    });
  }
);

const selectEditorArticleFragment = <T extends { editor: State }>(
  state: T,
  frontId: string
) => state.editor.selectedArticleFragments[frontId];

const defaultState = {
  showOpenFrontsMenu: false,
  frontIds: [],
  collectionIds: [],
  clipboardOpen: true,
  closedOverviews: [],
  selectedArticleFragments: {}
};

const clearArticleFragmentSelection = (state: State, frontId: string) => ({
  ...state,
  selectedArticleFragments: {
    ...state.selectedArticleFragments,
    [frontId]: undefined
  }
});

const reducer = (state: State = defaultState, action: Action): State => {
  switch (action.type) {
    case EDITOR_OPEN_CURRENT_FRONTS_MENU: {
      return {
        ...state,
        showOpenFrontsMenu: true
      };
    }

    case EDITOR_CLOSE_CURRENT_FRONTS_MENU: {
      return {
        ...state,
        showOpenFrontsMenu: false
      };
    }

    case EDITOR_OPEN_FRONT: {
      return {
        ...state,
        frontIds: state.frontIds.concat(action.payload.frontId)
      };
    }
    case EDITOR_MOVE_FRONT: {
      const maxIndex = state.frontIds.length - 1;
      if (
        state.frontIds.indexOf(action.payload.frontId) === -1 ||
        action.payload.fromIndex > maxIndex ||
        action.payload.toIndex > maxIndex
      ) {
        return state;
      }
      const frontIds = state.frontIds.slice();
      frontIds.splice(action.payload.fromIndex, 1);
      frontIds.splice(action.payload.toIndex, 0, action.payload.frontId);
      return {
        ...state,
        frontIds
      };
    }
    case EDITOR_CLOSE_FRONT: {
      return {
        ...state,
        frontIds: without(state.frontIds, action.payload.frontId)
      };
    }
    case EDITOR_CLEAR_OPEN_FRONTS: {
      return {
        ...state,
        frontIds: []
      };
    }
    case EDITOR_SET_OPEN_FRONTS: {
      return {
        ...state,
        frontIds: action.payload.frontIds
      };
    }
    case EDITOR_OPEN_COLLECTION: {
      return {
        ...state,
        collectionIds: state.collectionIds.concat(action.payload.collectionIds)
      };
    }
    case EDITOR_CLOSE_COLLECTION: {
      return {
        ...state,
        collectionIds: without(
          state.collectionIds,
          ...(Array.isArray(action.payload.collectionIds)
            ? action.payload.collectionIds
            : [action.payload.collectionIds])
        )
      };
    }
    case EDITOR_SELECT_ARTICLE_FRAGMENT: {
      return {
        ...state,
        selectedArticleFragments: {
          ...state.selectedArticleFragments,
          [action.payload.frontId]: {
            id: action.payload.articleFragmentId,
            isSupporting: action.payload.isSupporting
          }
        }
      };
    }
    case EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION: {
      return clearArticleFragmentSelection(state, action.payload.frontId);
    }
    case REMOVE_SUPPORTING_ARTICLE_FRAGMENT:
    case REMOVE_GROUP_ARTICLE_FRAGMENT:
    case REMOVE_CLIPBOARD_ARTICLE_FRAGMENT: {
      const articleFragmentId = action.payload.articleFragmentId;
      const selectedFrontId = Object.keys(state.selectedArticleFragments).find(
        frontId => {
          const selectedArticleFragmentData =
            state.selectedArticleFragments[frontId];
          return selectedArticleFragmentData
            ? selectedArticleFragmentData.id === articleFragmentId
            : false;
        }
      );
      return selectedFrontId
        ? clearArticleFragmentSelection(state, selectedFrontId)
        : state;
    }
    case EDITOR_OPEN_CLIPBOARD: {
      return {
        ...state,
        clipboardOpen: true
      };
    }
    case EDITOR_CLOSE_CLIPBOARD: {
      return {
        ...state,
        clipboardOpen: false
      };
    }
    case EDITOR_OPEN_OVERVIEW: {
      return {
        ...state,
        closedOverviews: state.closedOverviews.filter(
          id => id !== action.payload.frontId
        )
      };
    }
    case EDITOR_CLOSE_OVERVIEW: {
      return {
        ...state,
        closedOverviews: state.closedOverviews.concat(action.payload.frontId)
      };
    }
    case EDITOR_OPEN_ALL_OVERVIEWS: {
      return {
        ...state,
        closedOverviews: []
      };
    }
    case EDITOR_CLOSE_ALL_OVERVIEWS: {
      return {
        ...state,
        closedOverviews: [...state.frontIds]
      };
    }
    default: {
      return state;
    }
  }
};

export {
  editorOpenCurrentFrontsMenu as editorShowOpenFrontsMenu,
  editorCloseCurrentFrontsMenu as editorHideOpenFrontsMenu,
  editorOpenFront,
  editorMoveFront,
  editorCloseFront,
  editorClearOpenFronts,
  editorSetOpenFronts,
  editorOpenCollections,
  editorCloseCollections,
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  selectIsCurrentFrontsMenuOpen,
  selectEditorFrontIds,
  selectEditorFrontsByPriority,
  selectEditorArticleFragment,
  selectIsCollectionOpen,
  createSelectEditorFronts,
  editorOpenClipboard,
  editorCloseClipboard,
  editorOpenOverview,
  editorCloseOverview,
  editorOpenAllOverviews,
  editorCloseAllOverviews,
  selectIsClipboardOpen,
  selectIsFrontOverviewOpen
};

export default reducer;
