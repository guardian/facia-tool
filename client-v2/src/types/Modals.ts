import Modal from 'react-modal';
import { ReactNode } from 'react';

type StyledModalProps = Modal.Props & {
  width?: number;
};

interface OptionsModalChoices {
  buttonText: string;
  callback: () => void;
}

interface OptionsModalProps {
  title: string;
  description: string | ReactNode;
  isOpen: boolean;
  options: OptionsModalChoices[];
  onCancel: () => void;
  showCancelButton: boolean;
}

export { StyledModalProps, OptionsModalProps, OptionsModalChoices };
