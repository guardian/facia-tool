import set from 'lodash/fp/set';
import { Stages } from 'shared/types/Collection';
import { VisibleArticlesResponse } from 'types/FaciaApi';

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
  };
  collectionVisibility: {
    [stage in Stages]: {
      [collectionId: string]: VisibleArticlesResponse;
    }
  };
}

const reducer = (
  state: State = {
    frontsConfig: initialState,
    lastPressed: {},
    collectionVisibility: {
      draft: {},
      live: {}
    }
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
    case 'FETCH_VISIBLE_ARTICLES_SUCCESS': {
      const { collectionId, visibleArticles, stage } = action.payload;

      const collectionVisibilities = state.collectionVisibility[stage];
      const newCollectionVisibility = { [collectionId]: visibleArticles };
      const newVisibilities = {
        ...collectionVisibilities,
        ...newCollectionVisibility
      };

      return set(['collectionVisibility', stage], newVisibilities, newState);
    }
    default: {
      return newState;
    }
  }
};

export { State };

export default reducer;
