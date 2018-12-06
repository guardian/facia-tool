import {
  Action,
  EditorCloseFront,
  EditorClearOpenFronts,
  EditorSetOpenFronts,
  EditorAddFront,
  EditorSelectArticleFragment,
  EditorClearArticleFragmentSelection
} from 'types/Action';
import { State as GlobalState } from 'types/State';

const EDITOR_OPEN_FRONT = 'EDITOR_OPEN_FRONT';
const EDITOR_CLOSE_FRONT = 'EDITOR_CLOSE_FRONT';
const EDITOR_CLEAR_OPEN_FRONTS = 'EDITOR_CLEAR_OPEN_FRONTS';
const EDITOR_SET_OPEN_FRONTS = 'EDITOR_SET_OPEN_FRONTS';
const EDITOR_SELECT_ARTICLE_FRAGMENT = 'EDITOR_SELECT_ARTICLE_FRAGMENT';
const EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION =
  'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION';

const editorOpenFront = (frontId: string): EditorAddFront => ({
  type: EDITOR_OPEN_FRONT,
  payload: { frontId },
  meta: {
    persistTo: 'openFrontIds'
  }
});

const editorCloseFront = (frontId: string): EditorCloseFront => ({
  type: EDITOR_CLOSE_FRONT,
  payload: { frontId },
  meta: {
    persistTo: 'openFrontIds'
  }
});

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

interface State {
  frontIds: string[];
  selectedArticleFragments: {
    [frontId: string]: {
      id: string;
      isSupporting: boolean;
    } | void;
  };
}

const selectEditorFronts = (state: GlobalState) => state.editor.frontIds;

const selectEditorFrontsByPriority = (state: GlobalState, priority: string) => {
  const frontsInConfig = state.fronts.frontsConfig.data.fronts;
  return state.editor.frontIds.filter(frontId => {
    const frontConfig = frontsInConfig[frontId];
    return frontConfig && frontConfig.priority === priority;
  });
};

const selectEditorArticleFragment = (state: GlobalState, frontId: string) =>
  state.editor.selectedArticleFragments[frontId];

const defaultState = { frontIds: [], selectedArticleFragments: {} };

const reducer = (state: State = defaultState, action: Action): State => {
  switch (action.type) {
    case EDITOR_OPEN_FRONT: {
      return {
        ...state,
        frontIds: state.frontIds.concat(action.payload.frontId)
      };
    }
    case EDITOR_CLOSE_FRONT: {
      const frontIndex = state.frontIds.indexOf(action.payload.frontId);
      return {
        ...state,
        frontIds: [
          ...state.frontIds.slice(0, frontIndex),
          ...state.frontIds.slice(frontIndex + 1, state.frontIds.length)
        ]
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
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  selectEditorFronts,
  selectEditorFrontsByPriority,
  selectEditorArticleFragment
};

export default reducer;
