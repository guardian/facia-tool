import { State } from 'types/State';

export const confirmModalIsOpenSelector = (state: State) =>
  !!state.confirmModal;

export const confirmModalTitleSelector = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.title : '';

export const confirmModalDescriptionSelector = ({ confirmModal }: State) =>
  confirmModal ? confirmModal.description : '';

export const confirmModalActionsSelector = (
  { confirmModal }: State,
  accept: boolean
) =>
  confirmModal
    ? accept
      ? confirmModal.onAccept
      : confirmModal.onReject
    : null;
