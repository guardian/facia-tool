import { StartConfirm } from 'types/Action';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { selectConfirmModalCallback } from 'selectors/modalSelectors';
import { ReactNode } from 'react';

const startConfirmModal = (
  title: string,
  description: string | ReactNode,
  onAccept: () => void,
  onReject: () => void,
  showCancelButton: boolean = true
): StartConfirm => ({
  type: 'MODAL/START_CONFIRM',
  payload: {
    title,
    description,
    onAccept,
    onReject,
    showCancelButton
  }
});

const endConfirmModal = (accept: boolean) => (
  dispatch: Dispatch,
  getState: () => State
) => {
  const callback = selectConfirmModalCallback(getState(), accept) || (() => {});
  callback();
  dispatch({
    type: 'MODAL/END_CONFIRM'
  });
};

export { startConfirmModal, endConfirmModal };
