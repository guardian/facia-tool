import without from 'lodash/without';
import compact from 'lodash/compact';
import {
  Action,
  EditorOpenCurrentFrontsMenu,
  EditorCloseCurrentFrontsMenu,
  EditorCloseFront,
  EditorMoveFront,
  EditorClearOpenFronts,
  EditorSetOpenFronts,
  EditorAddFront,
  EditorFavouriteFront,
  EditorUnfavouriteFront,
  EditorSetFavouriteFronts,
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
import { getFronts, getFrontsWithPriority } from 'selectors/frontsSelectors';
import { createSelector } from 'reselect';
import {
  REMOVE_GROUP_ARTICLE_FRAGMENT,
  REMOVE_SUPPORTING_ARTICLE_FRAGMENT
} from 'shared/actions/ArticleFragments';

export const EDITOR_OPEN_CURRENT_FRONTS_MENU =
  'EDITOR_OPEN_CURRENT_FRONTS_MENU';
export const EDITOR_CLOSE_CURRENT_FRONTS_MENU =
  'EDITOR_CLOSE_CURRENT_FRONTS_MENU';
export const EDITOR_OPEN_FRONT = 'EDITOR_OPEN_FRONT';
export const EDITOR_MOVE_FRONT = 'EDITOR_MOVE_FRONT';
export const EDITOR_CLOSE_FRONT = 'EDITOR_CLOSE_FRONT';
export const EDITOR_FAVOURITE_FRONT = 'EDITOR_FAVOURITE_FRONT';
export const EDITOR_UNFAVOURITE_FRONT = 'EDITOR_UNFAVOURITE_FRONT';
export const EDITOR_SET_FAVE_FRONTS = 'EDITOR_SET_FAVE_FRONTS';
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

const editorOpenFront = (frontId: string, priority: string): EditorAddFront => {
  events.addFront(frontId);
  return {
    type: EDITOR_OPEN_FRONT,
    payload: { frontId, priority },
    meta: {
      persistTo: 'openFrontIds'
    }
  };
};

const editorMoveFront = (frontId: string, toIndex: number): EditorMoveFront => {
  events.moveFront(frontId);
  return {
    type: 'EDITOR_MOVE_FRONT',
    payload: { frontId, toIndex },
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

const editorFavouriteFront = (
  frontId: string,
  priority: string
): EditorFavouriteFront => {
  return {
    type: EDITOR_FAVOURITE_FRONT,
    payload: { frontId, priority },
    meta: {
      persistTo: 'favouriteFrontIds'
    }
  };
};

const editorUnfavouriteFront = (
  frontId: string,
  priority: string
): EditorUnfavouriteFront => {
  return {
    type: EDITOR_UNFAVOURITE_FRONT,
    payload: { frontId, priority },
    meta: {
      persistTo: 'favouriteFrontIds'
    }
  };
};

const editorClearOpenFronts = (): EditorClearOpenFronts => ({
  type: EDITOR_CLEAR_OPEN_FRONTS,
  meta: {
    persistTo: 'openFrontIds'
  }
});

const editorSetOpenFronts = (frontIdsByPriority: {
  [id: string]: string[];
}): EditorSetOpenFronts => ({
  type: EDITOR_SET_OPEN_FRONTS,
  payload: {
    frontIdsByPriority
  }
});

const editorSetFavouriteFronts = (favouriteFrontIdsByPriority: {
  [id: string]: string[];
}): EditorSetFavouriteFronts => ({
  type: EDITOR_SET_FAVE_FRONTS,
  payload: {
    favouriteFrontIdsByPriority
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
  articleFragmentId: string
): EditorClearArticleFragmentSelection => ({
  type: EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION,
  payload: { articleFragmentId }
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

interface OpenArticleFragmentData {
  id: string;
  isSupporting: boolean;
}

interface State {
  showOpenFrontsMenu: boolean;
  frontIds: string[];
  frontIdsByPriority: {
    [id: string]: string[];
  };
  favouriteFrontIdsByPriority: {
    [id: string]: string[];
  };
  collectionIds: string[];
  closedOverviews: string[];
  clipboardOpen: boolean;
  selectedArticleFragments: {
    [frontId: string]: OpenArticleFragmentData[];
  };
}

const selectIsCurrentFrontsMenuOpen = (state: GlobalState) =>
  state.editor.showOpenFrontsMenu;

const selectIsCollectionOpen = <T extends { editor: State }>(
  state: T,
  collectionId: string
) => state.editor.collectionIds.indexOf(collectionId) !== -1;

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

const createSelectEditorFrontsByPriority = () =>
  createSelector(
    getFronts,
    selectEditorFrontIds,
    selectPriority,
    (fronts, frontIdsByPriority, priority) => {
      const openFrontIds = frontIdsByPriority[priority] || [];
      return compact(openFrontIds.map(frontId => fronts[frontId]));
    }
  );

const createSelectFrontIdWithOpenAndStarredStatesByPriority = () => {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return createSelector(
    getFrontsWithPriority,
    (state, priority: string) =>
      selectEditorFrontsByPriority(state, { priority }),
    (state, priority: string) =>
      selectEditorFavouriteFrontIdsByPriority(state, priority),

    (frontsForPriority, openFronts, favouriteFronts) => {
      return frontsForPriority.map(({ id }) => ({
        id,
        isOpen: !!openFronts.find(_ => _.id === id),
        isStarred: !!favouriteFronts.includes(id)
      }));
    }
  );
};

const selectEditorFrontIds = (state: GlobalState) =>
  state.editor.frontIdsByPriority;

const selectEditorFavouriteFrontIds = (state: GlobalState) =>
  state.editor.favouriteFrontIdsByPriority;

const selectEditorFrontIdsByPriority = (
  state: GlobalState,
  priority: string
): string[] => state.editor.frontIdsByPriority[priority] || [];

const defaultFavouriteFronts = [] as [];

const selectEditorFavouriteFrontIdsByPriority = (
  state: GlobalState,
  priority: string
): string[] =>
  state.editor.favouriteFrontIdsByPriority[priority] || defaultFavouriteFronts;

const selectHasMultipleFrontsOpen = createSelector(
  selectEditorFrontIdsByPriority,
  frontIdsByPriority => {
    return frontIdsByPriority.length > 1;
  }
);

const selectEditorArticleFragment = <T extends { editor: State }>(
  state: T,
  frontId: string
) => state.editor.selectedArticleFragments[frontId];

const defaultState = {
  showOpenFrontsMenu: false,
  frontIds: [],
  frontIdsByPriority: {},
  favouriteFrontIdsByPriority: {},
  collectionIds: [],
  clipboardOpen: true,
  closedOverviews: [],
  selectedArticleFragments: {}
};

const clearArticleFragmentSelection = (
  state: State,
  articleFragmentId: string
): State => {
  let frontId: string | null = null;
  for (const entry of Object.entries(state.selectedArticleFragments)) {
    const [currentFrontId, fragmentDatas] = entry;
    const currentFragmentDataIndex = fragmentDatas.findIndex(
      _ => _.id === articleFragmentId
    );
    if (currentFragmentDataIndex !== -1) {
      frontId = currentFrontId;
      break;
    }
  }

  if (!frontId) {
    return state;
  }

  return {
    ...state,
    selectedArticleFragments: {
      ...state.selectedArticleFragments,
      [frontId]: state.selectedArticleFragments[frontId].filter(
        _ => _.id !== articleFragmentId
      )
    }
  };
};

const getFrontPosition = (
  frontId: string,
  frontIdsByPriority: {
    [priority: string]: string[];
  }
): { frontId: string; priority: string; index: number } | void => {
  const positions = Object.entries(frontIdsByPriority)
    .filter(([_, frontIds]) => frontIds.indexOf(frontId) !== -1)
    .map(([priority, frontIds]) => ({
      frontId,
      priority,
      index: frontIds.indexOf(frontId)
    }));
  if (positions.length) {
    return positions[0];
  }
};

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
      const priority = action.payload.priority;
      return {
        ...state,
        frontIdsByPriority: {
          ...state.frontIdsByPriority,
          [priority]: (state.frontIdsByPriority[priority] || []).concat(
            action.payload.frontId
          )
        }
      };
    }
    case EDITOR_MOVE_FRONT: {
      const maybeFrontPosition = getFrontPosition(
        action.payload.frontId,
        state.frontIdsByPriority
      );
      if (!maybeFrontPosition) {
        return state;
      }
      const { priority, index } = maybeFrontPosition;
      const maxIndex = state.frontIdsByPriority[priority].length - 1;
      const indexesOutOfBounds = action.payload.toIndex > maxIndex;
      if (indexesOutOfBounds) {
        return state;
      }
      const newFrontIds = state.frontIdsByPriority[priority].slice();
      newFrontIds.splice(index, 1);
      newFrontIds.splice(action.payload.toIndex, 0, action.payload.frontId);
      return {
        ...state,
        frontIdsByPriority: {
          ...state.frontIdsByPriority,
          [priority]: newFrontIds
        }
      };
    }
    case EDITOR_CLOSE_FRONT: {
      const maybeFrontPosition = getFrontPosition(
        action.payload.frontId,
        state.frontIdsByPriority
      );
      if (!maybeFrontPosition) {
        return state;
      }
      const { priority } = maybeFrontPosition;
      return {
        ...state,
        frontIdsByPriority: {
          ...state.frontIdsByPriority,
          [priority]: without(
            state.frontIdsByPriority[priority],
            action.payload.frontId
          )
        }
      };
    }
    case EDITOR_FAVOURITE_FRONT: {
      const priority = action.payload.priority;
      return {
        ...state,
        favouriteFrontIdsByPriority: {
          ...state.favouriteFrontIdsByPriority,
          [priority]: (
            state.favouriteFrontIdsByPriority[priority] || []
          ).concat(action.payload.frontId)
        }
      };
    }
    case EDITOR_UNFAVOURITE_FRONT: {
      const priority = action.payload.priority;
      return {
        ...state,
        favouriteFrontIdsByPriority: {
          ...state.favouriteFrontIdsByPriority,
          [priority]: without(
            state.favouriteFrontIdsByPriority[priority],
            action.payload.frontId
          )
        }
      };
    }
    case EDITOR_SET_FAVE_FRONTS: {
      return {
        ...state,
        favouriteFrontIdsByPriority: action.payload.favouriteFrontIdsByPriority
      };
    }
    case EDITOR_CLEAR_OPEN_FRONTS: {
      return {
        ...state,
        frontIds: [],
        frontIdsByPriority: {}
      };
    }
    case EDITOR_SET_OPEN_FRONTS: {
      return {
        ...state,
        frontIdsByPriority: action.payload.frontIdsByPriority
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
      const currentlyOpenArticleFragments =
        state.selectedArticleFragments[action.payload.frontId] || [];
      return {
        ...state,
        selectedArticleFragments: {
          ...state.selectedArticleFragments,
          [action.payload.frontId]: currentlyOpenArticleFragments.concat([
            {
              id: action.payload.articleFragmentId,
              isSupporting: action.payload.isSupporting
            }
          ])
        }
      };
    }
    case EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION: {
      return clearArticleFragmentSelection(
        state,
        action.payload.articleFragmentId
      );
    }
    case REMOVE_SUPPORTING_ARTICLE_FRAGMENT:
    case REMOVE_GROUP_ARTICLE_FRAGMENT:
    case 'REMOVE_CLIPBOARD_ARTICLE_FRAGMENT': {
      const articleFragmentId = action.payload.articleFragmentId;
      return clearArticleFragmentSelection(state, articleFragmentId);
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
  editorFavouriteFront,
  editorUnfavouriteFront,
  editorSetFavouriteFronts,
  editorClearOpenFronts,
  editorSetOpenFronts,
  editorOpenCollections,
  editorCloseCollections,
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  selectIsCurrentFrontsMenuOpen,
  createSelectEditorFrontsByPriority,
  createSelectFrontIdWithOpenAndStarredStatesByPriority,
  selectEditorFrontIds,
  selectEditorFavouriteFrontIds,
  selectEditorFrontIdsByPriority,
  selectEditorFavouriteFrontIdsByPriority,
  selectEditorArticleFragment,
  selectIsCollectionOpen,
  editorOpenClipboard,
  editorCloseClipboard,
  editorOpenOverview,
  editorCloseOverview,
  editorOpenAllOverviews,
  editorCloseAllOverviews,
  selectIsClipboardOpen,
  selectIsFrontOverviewOpen,
  selectHasMultipleFrontsOpen
};

export default reducer;
