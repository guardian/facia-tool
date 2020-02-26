import { StartOptionsModal } from 'types/Action';
import { ReactNode } from 'react';
import { OptionsModalChoices } from 'types/Modals';

const startOptionsModal = (
  title: string,
  description: string | ReactNode,
  options: OptionsModalChoices[],
  onCancel: () => void,
  showCancelButton: boolean = true
): StartOptionsModal => ({
  type: 'MODAL/START_OPTIONS_MODAL',
  payload: {
    title,
    description,
    options,
    onCancel,
    showCancelButton,
    isOpen: true
  }
});

const endOptionsModal = () => ({
  type: 'MODAL/END_OPTIONS_MODAL' as const
});

export { startOptionsModal, endOptionsModal };
