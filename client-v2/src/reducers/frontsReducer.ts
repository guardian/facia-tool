import set from 'lodash/fp/set';
import { Stages } from 'shared/types/Collection';
import { VisibleStoriesResponse } from 'types/faciaApi';

import { Action } from 'types/Action';
import {
  reducer as frontsConfigReducer,
  initialState,
  FrontsConfigState
} from 'bundles/frontsConfigBundle';

interface State {
  frontsConfig: FrontsConfigState;
  lastPressed: {
    [id: string]: string;
  },
  collectionVisibility: {
    [collectionId: string]: {
      [stage: Stages]: {
        visibleStories:VisibleStoriesResponse
      }
    }
}

const reducer = (
  state: State = {
    frontsConfig: initialState,
    lastPressed: {},
    collectionVisibility: {}
  },
  action: Action
): State => {
  // @todo - note the sneaky :any.
  const frontsConfig = frontsConfigReducer(state.frontsConfig, action as any);
  let newState = state;
  if (frontsConfig !== state.frontsConfig) {
    newState = {
      ...state,
      frontsConfig
    };
  }
  switch (action.type) {
    case 'FETCH_LAST_PRESSED_SUCCESS': {
      return set(
        ['lastPressed', action.payload.frontId],
        action.payload.datePressed,
        newState
      );
    }
    case 'FETCH_VISIBLE_STORIES_SUCCESS': {
      const { collectionId, visibleStories, stage } = action.payload;
      const newCollectionVisibility = {
        [collectionId]: {
          [stage]: visibleStories
        }
      }
      const visibility = { ...state.collectionVisibility, ...newCollectionVisibility };
      return {
        ...newState,
        collectionVisibility: visibility,
      };
    }
    default: {
      return newState;
    }
  }
};

export { State };

export default reducer;
