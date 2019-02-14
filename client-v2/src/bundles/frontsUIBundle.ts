import without from 'lodash/without';
import {
  Action,
  EditorCloseFront,
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

const EDITOR_OPEN_FRONT = 'EDITOR_OPEN_FRONT';
const EDITOR_CLOSE_FRONT = 'EDITOR_CLOSE_FRONT';
const EDITOR_CLEAR_OPEN_FRONTS = 'EDITOR_CLEAR_OPEN_FRONTS';
const EDITOR_SET_OPEN_FRONTS = 'EDITOR_SET_OPEN_FRONTS';
const EDITOR_OPEN_COLLECTION = 'EDITOR_OPEN_COLLECTION';
const EDITOR_CLOSE_COLLECTION = 'EDITOR_CLOSE_COLLECTION';
const EDITOR_SELECT_ARTICLE_FRAGMENT = 'EDITOR_SELECT_ARTICLE_FRAGMENT';
const EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION =
  'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION';
const EDITOR_OPEN_CLIPBOARD = 'EDITOR_OPEN_CLIPBOARD';
const EDITOR_CLOSE_CLIPBOARD = 'EDITOR_CLOSE_CLIPBOARD';
const EDITOR_OPEN_OVERVIEW = 'EDITOR_OPEN_OVERVIEW';
const EDITOR_CLOSE_OVERVIEW = 'EDITOR_CLOSE_OVERVIEW';
const EDITOR_OPEN_ALL_OVERVIEWS = 'EDITOR_OPEN_ALL_OVERVIEWS';
const EDITOR_CLOSE_ALL_OVERVIEWS = 'EDITOR_CLOSE_ALL_OVERVIEWS';

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

const selectEditorFronts = (state: GlobalState) => state.editor.frontIds;
const selectIsCollectionOpen = (state: GlobalState, collectionId: string) =>
  state.editor.collectionIds.indexOf(collectionId) !== -1;

const selectIsClipboardOpen = (state: GlobalState) =>
  state.editor.clipboardOpen;

const selectIsFrontOverviewOpen = (state: GlobalState, frontId: string) =>
  !state.editor.closedOverviews.includes(frontId);

const selectEditorFrontsByPriority = (state: GlobalState, priority: string) => {
  const frontsInConfig = state.fronts.frontsConfig.data.fronts;
  return state.editor.frontIds.filter(frontId => {
    const frontConfig = frontsInConfig[frontId];
    return frontConfig && frontConfig.priority === priority;
  });
};

const selectEditorArticleFragment = (state: GlobalState, frontId: string) =>
  state.editor.selectedArticleFragments[frontId];

const defaultState = {
  frontIds: [],
  collectionIds: [],
  clipboardOpen: true,
  closedOverviews: [],
  selectedArticleFragments: {}
};

const reducer = (state: State = defaultState, action: Action): State => {
  console.log(action);
  switch (action.type) {
    case EDITOR_OPEN_FRONT: {
      return {
        ...state,
        frontIds: state.frontIds.concat(action.payload.frontId)
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
      return {
        ...state,
        selectedArticleFragments: {
          ...state.selectedArticleFragments,
          [action.payload.frontId]: undefined
        }
      };
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
  editorOpenFront,
  editorCloseFront,
  editorClearOpenFronts,
  editorSetOpenFronts,
  editorOpenCollections,
  editorCloseCollections,
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  selectEditorFronts,
  selectEditorFrontsByPriority,
  selectEditorArticleFragment,
  selectIsCollectionOpen,
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
