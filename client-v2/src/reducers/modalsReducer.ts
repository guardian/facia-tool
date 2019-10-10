import { Action } from 'types/Action';
import { OptionsModalChoices } from 'types/Modals';

// this state represents either a closed modal, or a modal that is open, where
// the action is that action that was intended to be fired
type ModalState = null | {
  title: string;
  description: string;
  onAccept: () => void;
  onReject: () => void;
  showCancelButton: boolean;
};

type OptionsModalState = null | {
  title: string;
  description: string;
  options: OptionsModalChoices[];
  onReject: () => void;
  showCancelButton: boolean;
};

export const confirmModal = (state: ModalState, action: Action) => {
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

export const optionsModal = (state: OptionsModalState, action: Action) => {
  switch (action.type) {
    case 'MODAL/START_OPTIONS_MODAL': {
      return action.payload;
    }
    case 'MODAL/END_OPTIONS_MODAL': {
      return null;
    }
    default: {
      return state;
    }
  }
};

export default { optionsModal, confirmModal };
