import without from 'lodash/without';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
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
  EditorCloseAllOverviews,
  ChangedBrowsingStage
} from 'types/Action';
import { State as GlobalState } from 'types/State';
import flatten from 'lodash/flatten';
import { createSelector } from 'reselect';

import { State as GlobalSharedState } from 'shared/types/State';
import { events } from 'services/GA';
import {
  selectFronts,
  selectFrontsWithPriority
} from 'selectors/frontsSelectors';
import {
  REMOVE_GROUP_ARTICLE_FRAGMENT,
  REMOVE_SUPPORTING_ARTICLE_FRAGMENT
} from 'shared/actions/ArticleFragments';
import { Stages } from 'shared/types/Collection';
import { selectPriority } from 'selectors/pathSelectors';
import { CollectionWithArticles } from 'shared/types/PageViewData';
import {
  createSelectArticlesInCollection,
  selectSharedState
} from 'shared/selectors/shared';

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
export const CHANGED_BROWSING_STAGE = 'CHANGED_BROWSING_STAGE';
export const EDITOR_CLOSE_FORMS_FOR_COLLECTION = 'EDITOR_CLOSE_FORMS_FOR_COLLECTION' as const;

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

const changedBrowsingStage = (
  frontId: string,
  browsingStage: Stages
): ChangedBrowsingStage => {
  return {
    type: CHANGED_BROWSING_STAGE,
    payload: {
      frontId,
      browsingStage
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
  articleFragmentId: string,
  collectionId: string,
  frontId: string,
  isSupporting = false
): EditorSelectArticleFragment => ({
  type: EDITOR_SELECT_ARTICLE_FRAGMENT,
  payload: { articleFragmentId, frontId, collectionId, isSupporting }
});

const editorClearArticleFragmentSelection = (
  articleFragmentId: string
): EditorClearArticleFragmentSelection => ({
  type: EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION,
  payload: { articleFragmentId }
});

const editorCloseFormsForCollection = (
  collectionId: string,
  frontId: string
) => ({
  type: EDITOR_CLOSE_FORMS_FOR_COLLECTION,
  payload: { collectionId, frontId }
});

type EditorCloseFormsForCollection = ReturnType<
  typeof editorCloseFormsForCollection
>;

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
  collectionId: string;
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
  frontIdsByBrowsingStage: {
    [frontId: string]: Stages;
  };
}

const selectIsCurrentFrontsMenuOpen = (state: GlobalState) =>
  state.editor.showOpenFrontsMenu;

const selectIsCollectionOpen = <T extends { editor: State }>(
  state: T,
  collectionId: string
) => state.editor.collectionIds.indexOf(collectionId) !== -1;

const selectOpenCollections = <T extends { editor: State }>(state: T) =>
  state.editor.collectionIds;

const selectIsClipboardOpen = <T extends { editor: State }>(state: T) =>
  state.editor.clipboardOpen;

const selectIsFrontOverviewOpen = <T extends { editor: State }>(
  state: T,
  frontId: string
) => !state.editor.closedOverviews.includes(frontId);

const createSelectFrontIdWithOpenAndStarredStatesByPriority = () => {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return createSelector(
    selectFrontsWithPriority,
    selectEditorFrontsByPriority,
    (state, priority: string) =>
      selectEditorFavouriteFrontIdsByPriority(state, priority),
    (_, __, sortKey: 'id' | 'index' = 'id') => sortKey,
    (frontsForPriority, openFronts, favouriteFronts, sortKey) => {
      const fronts = frontsForPriority.map(({ id, displayName, index }) => ({
        id,
        displayName,
        index,
        isOpen: !!openFronts.find(_ => _.id === id),
        isStarred: !!favouriteFronts.includes(id)
      }));
      return sortBy(fronts, front => front[sortKey]);
    }
  );
};

function createSelectCollectionsInOpenFronts() {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return (state: GlobalState): string[] => {
    const openFrontsForPriority = selectEditorFrontsByPriority(state);
    return flatten(openFrontsForPriority.map(front => front.collections));
  };
}

const createSelectCurrentlyOpenCollectionsByFront = () => {
  const selectEditorFrontsByPriority = createSelectEditorFrontsByPriority();
  return createSelector(
    selectEditorFrontsByPriority,
    selectOpenCollections,
    (openFronts, openCollectionIds) => {
      const openFrontsWithCollections = openFronts.map(front => ({
        id: front.id,
        collections: front.collections
      }));
      return openFrontsWithCollections.map(front => {
        const collections = front.collections.filter(collection =>
          openCollectionIds.includes(collection)
        );
        return {
          frontId: front.id,
          collections
        };
      });
    }
  );
};

/**
 * Select the parent front of an article fragment.
 * For performance reasons, only considers open fronts and collections.
 */
const selectOpenParentFrontOfArticleFragment = (
  state: GlobalState,
  articleFragmentId: string
) => {
  const openFrontsCollectionsAndArticles = selectOpenFrontsCollectionsAndArticles(
    state
  );
  const front = openFrontsCollectionsAndArticles.find(frontAndCollections =>
    frontAndCollections.collections.some(collection =>
      collection.articleIds.some(articleId => articleId === articleFragmentId)
    )
  );
  return front ? front.frontId : undefined;
};

const selectOpenArticleFragmentIds = (state: GlobalState): string[] => {
  const frontsCollectionsAndArticles = selectOpenFrontsCollectionsAndArticles(
    state
  );
  const collections = frontsCollectionsAndArticles.reduce(
    (acc, front) => acc.concat(front.collections),
    [] as CollectionWithArticles[]
  );
  const articles = collections.reduce(
    (acc, collection) => acc.concat(collection.articleIds),
    [] as string[]
  );
  return articles;
};

const selectEditorFrontIds = (state: GlobalState) =>
  state.editor.frontIdsByPriority;

const createSelectEditorFrontsByPriority = () =>
  createSelector(
    selectFronts,
    selectEditorFrontIds,
    selectPriority,
    (fronts, frontIdsByPriority, priority) => {
      if (!priority) {
        return [];
      }
      const openFrontIds = frontIdsByPriority[priority] || [];
      return compact(openFrontIds.map(frontId => fronts[frontId]));
    }
  );

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

const defaultOpenForms = [] as [];

const selectOpenArticleFragmentForms = (state: GlobalState, frontId: string) =>
  state.editor.selectedArticleFragments[frontId] || defaultOpenForms;

const selectIsArticleFragmentFormOpen = (
  state: GlobalState,
  articleFragmentId: string,
  frontId: string
) => {
  return (selectOpenArticleFragmentForms(state, frontId) || []).some(
    _ => _.id === articleFragmentId
  );
};

const createSelectCollectionIdsWithOpenForms = () =>
  createSelector(
    selectOpenArticleFragmentForms,
    forms => uniq(forms.map(_ => _.collectionId))
  );

const selectCollectionId = (_: GlobalState, collectionId: string) =>
  collectionId;

const createSelectDoesCollectionHaveOpenForms = () =>
  createSelector(
    selectOpenArticleFragmentForms,
    selectCollectionId,
    (forms, collectionId) => forms.some(_ => _.collectionId === collectionId)
  );

const selectFrontBrowsingStage = (state: GlobalState, frontId: string) =>
  state.editor.frontIdsByBrowsingStage[frontId] || 'draft';

const selectAllArticleIdsForCollection = createSelectArticlesInCollection();
const selectCurrentlyOpenCollectionsByFront = createSelectCurrentlyOpenCollectionsByFront();

const selectOpenFrontsCollectionsAndArticles = (
  state: GlobalState
): Array<{ frontId: string; collections: CollectionWithArticles[] }> => {
  const openCollectionsByFront = selectCurrentlyOpenCollectionsByFront(state);
  return openCollectionsByFront.map(frontAndCollections => {
    const browsingStage = selectFrontBrowsingStage(
      state,
      frontAndCollections.frontId
    );
    const collections = frontAndCollections.collections.map((cId: string) => {
      const articleIds: string[] = selectAllArticleIdsForCollection(
        selectSharedState(state),
        {
          collectionId: cId,
          collectionSet: browsingStage,
          includeSupportingArticles: false
        }
      );
      return {
        id: cId,
        articleIds
      };
    });
    return {
      frontId: frontAndCollections.frontId,
      collections
    };
  });
};

const defaultState = {
  showOpenFrontsMenu: false,
  frontIds: [],
  frontIdsByPriority: {},
  favouriteFrontIdsByPriority: {},
  collectionIds: [],
  clipboardOpen: true,
  closedOverviews: [],
  selectedArticleFragments: {},
  frontIdsByBrowsingStage: {}
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

const reducer = (
  state: State = defaultState,
  action: Action,
  sharedState: GlobalSharedState
): State => {
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

    case CHANGED_BROWSING_STAGE: {
      return {
        ...state,
        frontIdsByBrowsingStage: {
          ...state.frontIdsByBrowsingStage,
          [action.payload.frontId]: action.payload.browsingStage
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
      const {
        frontId,
        collectionId,
        isSupporting,
        articleFragmentId: id
      } = action.payload;
      const openArticleFragments = currentlyOpenArticleFragments.concat([
        {
          id,
          isSupporting,
          collectionId
        }
      ]);
      return {
        ...state,
        selectedArticleFragments: {
          ...state.selectedArticleFragments,
          [frontId]: openArticleFragments
        }
      };
    }
    case EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION: {
      return clearArticleFragmentSelection(
        state,
        action.payload.articleFragmentId
      );
    }
    case EDITOR_CLOSE_FORMS_FOR_COLLECTION: {
      const maybeOpenFormsForFront =
        state.selectedArticleFragments[action.payload.frontId];

      if (!maybeOpenFormsForFront) {
        return state;
      }
      return maybeOpenFormsForFront.reduce(
        (acc, formData) =>
          formData.collectionId === action.payload.collectionId
            ? clearArticleFragmentSelection(acc, formData.id)
            : acc,
        state
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
  selectIsArticleFragmentFormOpen,
  selectOpenArticleFragmentForms,
  selectOpenParentFrontOfArticleFragment,
  createSelectEditorFrontsByPriority,
  createSelectFrontIdWithOpenAndStarredStatesByPriority,
  selectEditorFrontIds,
  selectEditorFavouriteFrontIds,
  selectEditorFrontIdsByPriority,
  selectEditorFavouriteFrontIdsByPriority,
  selectOpenFrontsCollectionsAndArticles,
  createSelectCollectionsInOpenFronts,
  selectOpenArticleFragmentIds,
  selectIsCollectionOpen,
  editorOpenClipboard,
  editorCloseClipboard,
  editorOpenOverview,
  editorCloseOverview,
  editorOpenAllOverviews,
  editorCloseAllOverviews,
  selectIsClipboardOpen,
  selectIsFrontOverviewOpen,
  selectHasMultipleFrontsOpen,
  createSelectCollectionIdsWithOpenForms,
  createSelectDoesCollectionHaveOpenForms,
  OpenArticleFragmentData,
  changedBrowsingStage,
  EditorCloseFormsForCollection,
  editorCloseFormsForCollection,
  defaultState
};

export default reducer;
