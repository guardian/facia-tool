import { State } from 'types/State';
import noop from 'lodash/noop';
import { OptionsModalChoices } from 'types/Modals';

export const selectConfirmModalIsOpen = (state: State) => !!state.confirmModal;

export const selectConfirmModalTitle = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.title : '';

export const selectConfirmModalDescription = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.description : '';

export const selectConfirmModalCallback = (
  { confirmModal }: State,
  accept: boolean
) =>
  confirmModal
    ? accept
      ? confirmModal.onAccept
      : confirmModal.onReject
    : noop;

export const selectConfirmModalShowCancelButton = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.showCancelButton : true;

export const selectOptionsModalIsOpen = (state: State) => !!state.optionsModal;

export const selectOptionsModalTitle = ({ optionsModal }: State) =>
  optionsModal ? optionsModal.title : '';

export const selectOptionsModalDescription = ({ optionsModal }: State) =>
  optionsModal ? optionsModal.description : '';

const defaultOptionsArray: OptionsModalChoices[] = [];

export const selectOptionsModalOptions = ({ optionsModal }: State) =>
  optionsModal ? optionsModal.options : defaultOptionsArray;

export const selectOptionsModalShowCancelButton = ({ optionsModal }: State) =>
  optionsModal ? optionsModal.showCancelButton : true;
