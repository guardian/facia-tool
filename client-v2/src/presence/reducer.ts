import { PresenceState, PresenceAction } from './types';

const reducer = (state: PresenceState = {}, action: PresenceAction) => {
  switch (action.type) {
    case 'PRESENCE/UPDATE_ENTRIES': {
      return {
        ...state,
        [action.payload.articleFragmentId]: action.payload.entries
      };
    }
    case 'PRESENCE/REMOVE_ENTRIES': {
      const { [action.payload.articleFragmentId]: omit, ...rest } = state;
      return rest;
    }
    default: {
      return state;
    }
  }
};

export { reducer };
