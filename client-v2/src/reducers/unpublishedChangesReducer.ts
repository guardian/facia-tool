import { Action } from 'types/Action';

interface State {
  [id: string]: boolean;
}

const unpublishedChanges = (state: State = {}, action: Action): State => {
  switch (action.type) {
    case 'RECORD_UNPUBLISHED_CHANGES': {
      const { payload } = action;
      return { ...state, ...payload };
    }
    default: {
      return state;
    }
  }
};

export default unpublishedChanges;
