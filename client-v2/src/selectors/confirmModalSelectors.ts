import { State } from 'types/State';

export const selectConfirmModalIsOpen = (state: State) => !!state.confirmModal;

export const selectConfirmModalTitle = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.title : '';

export const selectConfirmModalDescription = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.description : '';

export const selectConfirmModalActions = (
  { confirmModal }: State,
  accept: boolean
) =>
  confirmModal
    ? accept
      ? confirmModal.onAccept
      : confirmModal.onReject
    : null;
