import React from 'react';
import Modal from 'react-modal';
import { State } from 'types/State';
import {
  selectConfirmModalIsOpen,
  selectConfirmModalTitle,
  selectConfirmModalDescription
} from 'selectors/confirmModalSelectors';
import { Dispatch } from 'types/Store';
import { endConfirmModal } from 'actions/ConfirmModal';
import { connect } from 'react-redux';
import { styled } from 'constants/theme';
import ButtonDefault from 'shared/components/input/ButtonDefault';

type StyledModalProps = Modal.Props & {
  width?: number;
};

const StyledModal = styled(Modal)`
  position: absolute;
  top: 40px;
  font-size: 14px;
  left: 50%;
  background: ${({ theme }) => theme.shared.base.colors.backgroundColorLight};
  overflow: auto;
  outline: none;
  padding: 20px;
  margin-left: -${({ width = 400 }: StyledModalProps) => width / 2}px;
  min-height: 200px;
  width: ${({ width = 400 }: StyledModalProps) => width}px;
`;

const Actions = styled.div`
  border-top: ${({ theme }) =>
    `solid 1px ${theme.shared.base.colors.borderColor}`};
  margin-top: 1.5em;
  padding-top: 1.5em;
  text-align: right;
`;

interface ConfirmModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const ConfirmModal = ({
  title,
  description,
  isOpen,
  onAccept,
  onReject
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
    <h1>{title}</h1>
    {description && <p>{description}</p>}
    <Actions>
      <ButtonDefault size="l" inline onClick={onReject}>
        Cancel
      </ButtonDefault>
      <ButtonDefault size="l" inline priority="primary" onClick={onAccept}>
        Proceed
      </ButtonDefault>
    </Actions>
  </StyledModal>
);

const mapStateToProps = (state: State) => ({
  isOpen: selectConfirmModalIsOpen(state),
  title: selectConfirmModalTitle(state),
  description: selectConfirmModalDescription(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAccept: () => dispatch(endConfirmModal(true)),
  onReject: () => dispatch(endConfirmModal(false))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmModal);
