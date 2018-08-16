// @flow

import { type Action } from 'types/Action';
import { type State as GlobalState } from 'types/State';

const EDITOR_ADD_FRONT = 'EDITOR_ADD_FRONT';
const EDITOR_REMOVE_FRONT = 'EDITOR_REMOVE_FRONT';
const EDITOR_CLEAR_FRONTS = 'EDITOR_CLEAR_FRONTS';
const EDITOR_SELECT_ARTICLE_FRAGMENT = 'EDITOR_SELECT_ARTICLE_FRAGMENT';
const EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION =
  'EDITOR_CLEAR_ARTICLE_FRAGMENT_SELECTION';

const editorAddFront = (frontId: string) => ({
  type: EDITOR_ADD_FRONT,
  payload: { frontId }
});
const editorRemoveFront = (frontId: string) => ({
  type: EDITOR_REMOVE_FRONT,
  payload: { frontId }
});

const editorClearFronts = () => ({
  type: EDITOR_CLEAR_FRONTS
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

const reducer = (
  state: State = { frontIds: [], selectedArticleFragments: {} },
  action: Action
): State => {
  switch (action.type) {
    case EDITOR_ADD_FRONT: {
      return {
        ...state,
        frontIds: state.frontIds.concat(action.payload.frontId)
      };
    }
    case EDITOR_REMOVE_FRONT: {
      const frontIndex = state.frontIds.indexOf(action.payload.frontId);
      return {
        ...state,
        frontIds: [
          ...state.frontIds.slice(0, frontIndex),
          ...state.frontIds.slice(frontIndex + 1, state.frontIds.length)
        ]
      };
    }
    case EDITOR_CLEAR_FRONTS: {
      return {
        ...state,
        frontIds: []
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
  editorAddFront,
  editorRemoveFront,
  editorClearFronts,
  editorSelectArticleFragment,
  editorClearArticleFragmentSelection,
  selectEditorFronts,
  selectEditorArticleFragment
};

export default reducer;
