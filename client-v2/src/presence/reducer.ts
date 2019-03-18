import { PresenceState, PresenceAction } from './types';

const reducer = (
  state: PresenceState = { entryMap: {}, isConnected: false },
  action: PresenceAction
) => {
  switch (action.type) {
    case 'PRESENCE/UPDATE_ENTRIES': {
      return {
        ...state,
        entryMap: { [action.payload.articleFragmentId]: action.payload.entries }
      };
    }
    case 'PRESENCE/REMOVE_ENTRIES': {
      const {
        entryMap: { [action.payload.articleFragmentId]: omit, ...rest }
      } = state;
      return {
        ...state,
        entryMap: rest
      };
    }
    case 'PRESENCE/SET_CONNECTION_STATUS': {
      return {
        ...state,
        isConnected: action.payload.isConnected
      };
    }
    default: {
      return state;
    }
  }
};

export { reducer };
