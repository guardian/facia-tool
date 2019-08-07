import { Action, StartConfirm } from 'types/Action';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { selectConfirmModalActions } from 'selectors/confirmModalSelectors';
import { ReactNode } from 'react';

const startConfirmModal = (
  title: string,
  description: string | ReactNode,
  onAccept: Action[],
  onReject: Action[] = [],
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
  const actions = selectConfirmModalActions(getState(), accept) || [];
  actions.forEach(ac => dispatch(ac));
  dispatch({
    type: 'MODAL/END_CONFIRM'
  });
};

export { startConfirmModal, endConfirmModal };
