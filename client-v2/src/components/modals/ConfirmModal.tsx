import React from 'react';
import { State } from 'types/State';
import {
  selectConfirmModalIsOpen,
  selectConfirmModalTitle,
  selectConfirmModalDescription,
  selectConfirmModalShowCancelButton
} from 'selectors/modalSelectors';
import { Dispatch } from 'types/Store';
import { endConfirmModal } from 'actions/ConfirmModal';
import { connect } from 'react-redux';
import ButtonDefault from 'shared/components/input/ButtonDefault';
import { StyledModal, Actions } from './StyledModal';
import { ConfirmModalProps } from 'types/Modals';

const ConfirmModal = ({
  title,
  description,
  isOpen,
  onAccept,
  onReject,
  showCancelButton
}: ConfirmModalProps) => (
  <StyledModal
    style={{
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000
      }
    }}
    isOpen={isOpen}
    onRequestClose={onReject}
  >
    <h1 data-testid="confirm-modal">{title}</h1>
    {description &&
      (typeof description === 'string' ? <p>{description}</p> : description)}
    <Actions>
      {showCancelButton && (
        <ButtonDefault size="l" inline onClick={onReject}>
          Cancel
        </ButtonDefault>
      )}
      <ButtonDefault size="l" inline priority="primary" onClick={onAccept}>
        Proceed
      </ButtonDefault>
    </Actions>
  </StyledModal>
);

const mapStateToProps = (state: State) => ({
  isOpen: selectConfirmModalIsOpen(state),
  title: selectConfirmModalTitle(state),
  description: selectConfirmModalDescription(state),
  showCancelButton: selectConfirmModalShowCancelButton(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAccept: () => dispatch(endConfirmModal(true)),
  onReject: () => dispatch(endConfirmModal(false))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmModal);
