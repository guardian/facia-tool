// @flow

import { type Action } from 'types/Action';
import { type State as GlobalState } from 'types/State';

const EDITOR_OPEN_FRONT = 'EDITOR_OPEN_FRONT';
const EDITOR_CLOSE_FRONT = 'EDITOR_CLOSE_FRONT';
const EDITOR_CLEAR_OPEN_FRONTS = 'EDITOR_CLEAR_OPEN_FRONTS';
const EDITOR_SET_OPEN_FRONTS = 'EDITOR_SET_OPEN_FRONTS';
const EDITOR_SELECT_ARTICLE_FRAGMENT = 'EDITOR_SELECT_ARTICLE_FRAGMENT';
const EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION =
  'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION';

const editorOpenFront = (frontId: string) => ({
  type: EDITOR_OPEN_FRONT,
  payload: { frontId },
  meta: {
    persistTo: 'openFrontIds'
  }
});
const editorCloseFront = (frontId: string) => ({
  type: EDITOR_CLOSE_FRONT,
  payload: { frontId },
  meta: {
    persistTo: 'openFrontIds'
  }
});

const editorClearOpenFronts = () => ({
  type: EDITOR_CLEAR_OPEN_FRONTS,
  meta: {
    persistTo: 'openFrontIds'
  }
});

const editorSetOpenFronts = (frontIds: string[]) => ({
  type: EDITOR_SET_OPEN_FRONTS,
  payload: {
    frontIds
  }
});

const editorSelectArticleFragment = (
  frontId: string,
  articleFragmentId: string
) => ({
  type: EDITOR_SELECT_ARTICLE_FRAGMENT,
  payload: { articleFragmentId, frontId }
});

const editorClearArticleFragmentSelection = (frontId: string) => ({
  type: EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION,
  payload: { frontId }
});

type State = {
  frontIds: string[],
  selectedArticleFragments: { [frontId: string]: ?string }
};

const selectEditorFronts = (state: GlobalState) => state.editor.frontIds;
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
          [action.payload.frontId]: action.payload.articleFragmentId
        }
      };
    }
    case EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION: {
      return {
        ...state,
        selectedArticleFragments: {
          ...state.selectedArticleFragments,
          [action.payload.frontId]: null
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
  selectEditorArticleFragment
};

export default reducer;
