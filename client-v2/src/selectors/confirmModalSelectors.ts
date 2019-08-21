import { State } from 'types/State';
import noop from 'lodash/noop';

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
