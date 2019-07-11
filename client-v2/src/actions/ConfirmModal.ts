import { Action, StartConfirm } from 'types/Action';
import { State } from 'types/State';
import { Dispatch } from 'types/Store';
import { selectConfirmModalActions } from 'selectors/confirmModalSelectors';

const startConfirmModal = (
  title: string,
  description: string,
  onAccept: Action[],
  onReject: Action[] = []
): StartConfirm => ({
  type: 'MODAL/START_CONFIRM',
  payload: {
    title,
    description,
    onAccept,
    onReject
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
