import { Action } from 'types/Action';
import { OptionsModalChoices } from 'types/Modals';

type OptionsModalState = null | {
  title: string;
  description: string;
  options: OptionsModalChoices[];
  onCancel: () => void;
  showCancelButton: boolean;
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

export default { optionsModal };
