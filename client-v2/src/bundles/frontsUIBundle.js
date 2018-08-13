// @flow

import { type Action } from 'types/Action';
import { type State as GlobalState } from 'types/State';

const EDITOR_ADD_FRONT = 'EDITOR_ADD_FRONT';
const EDITOR_REMOVE_FRONT = 'EDITOR_REMOVE_FRONT';
const EDITOR_CLEAR_FRONTS = 'EDITOR_CLEAR_FRONTS';

const editorAddFront = (frontId: string) => ({
  type: EDITOR_ADD_FRONT,
  payload: { frontId }
});

type EditorAddFront = {|
  type: 'EDITOR_ADD_FRONT',
  payload: { frontId: string }
|};

const editorRemoveFront = (frontId: string) => ({
  type: EDITOR_REMOVE_FRONT,
  payload: { frontId }
});

type EditorRemoveFront = {|
  type: 'EDITOR_REMOVE_FRONT',
  payload: { frontId: string }
|};

const editorClearFronts = () => ({
  type: EDITOR_CLEAR_FRONTS
});

type EditorClearFronts = {|
  type: 'EDITOR_CLEAR_FRONTS'
|};

type State = {
  frontIds: string[]
};

const selectEditorFronts = (state: GlobalState) => state.editor.frontIds;

const reducer = (state: State = { frontIds: [] }, action: Action): State => {
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
    default: {
      return state;
    }
  }
};

export type { EditorAddFront, EditorRemoveFront, EditorClearFronts };

export {
  editorAddFront,
  editorRemoveFront,
  editorClearFronts,
  selectEditorFronts
};

export default reducer;
