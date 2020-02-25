import { Action } from 'types/Action';
import { OptionsModalChoices } from 'types/Modals';
import { ReactNode } from 'react';

type OptionsModalState = null | {
  title: string;
  description: string | ReactNode;
  options: OptionsModalChoices[];
  onCancel: () => void;
  showCancelButton: boolean;
};

const optionsModal = (state: OptionsModalState, action: Action) => {
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
export { OptionsModalState };
export default optionsModal;
