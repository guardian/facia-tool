import { Action } from 'types/Action';

// this state represents either a closed modal, or a modal that is open, where
// the action is that action that was intended to be fired
type ModalState = null | {
  title: string;
  description: string;
  onAccept: Action[];
  onReject: Action[];
  showCancelButton: boolean;
};

const confirmModal = (state: ModalState, action: Action) => {
  switch (action.type) {
    case 'MODAL/START_CONFIRM': {
      return action.payload;
    }
    case 'MODAL/END_CONFIRM': {
      return null;
    }
    default: {
      return state;
    }
  }
};

export default confirmModal;
